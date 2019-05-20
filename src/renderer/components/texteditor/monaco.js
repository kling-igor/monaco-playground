import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import React, { Component } from 'react'
import styled from 'styled-components'
import { Disposable, CompositeDisposable } from 'event-kit'

import debounce from 'lodash.debounce'

import ESLintWorker from 'worker-loader!./eslint.worker.js'

import uuidv4 from 'uuid/v4'

const RootStyle = styled.div`
  width: 100%;
  height: 100%;
`

function noop() {}

function processSize(size) {
  return !/^\d+$/.test(size) ? size : `${size}px`
}

export class MonacoEditor extends Component {
  component = null

  constructor(props) {
    super(props)

    this.uuid = uuidv4()

    console.log('MonacoEditor: ctor ', this.uuid)

    // this.state = {file: props.file}

    this.file = props.file

    this.containerRef = React.createRef()

    this.subscriptions = new CompositeDisposable()

    props.lintCode(this.lintCode)

    this.component = <RootStyle className="react-monaco-editor-container" ref={this.containerRef} />
  }

  componentDidMount() {
    console.log('MonacoEditor: componentDidMount ', this.uuid)

    this.worker = new ESLintWorker()

    const { theme = null, options = {} } = this.props

    if (this.containerRef.current) {
      Object.assign(options, this.editorWillMount())

      this.editor = monaco.editor.create(this.containerRef.current, {
        ...options,
        model: null
      })

      this.debouncedLinting = debounce(this.lintCode, 1000)

      this.__prevent_trigger_change_event = true
      this.editor.setModel(this.file.monacoModel)
      this.debouncedLinting()
      this.__prevent_trigger_change_event = false

      const { editorDidMount = noop, onChange = noop, onCursorPositionChange = noop } = this.props

      editorDidMount(this.editor, monaco)

      // emitted when the content of the current model has changed.
      this.subscriptions.add(
        this.editor.onDidChangeModel(event => {
          const { lineNumber, column } = this.editor.getPosition()
          onCursorPositionChange(lineNumber, column)
          this.debouncedLinting()
        }),

        this.editor.onDidChangeModelContent(event => {
          // Only invoking when user input changed
          if (!this.__prevent_trigger_change_event) {
            onChange(this.file.monacoModel.getValue(), event)
            this.debouncedLinting()
          }
        }),

        this.editor.onDidChangeCursorPosition(event => {
          const {
            position: { lineNumber, column }
          } = event
          onCursorPositionChange(lineNumber, column)
        })
      )

      // emitted when the cursor selection has changed.
      // onDidChangeCursorSelection

      // emitted when the text inside this editor gained focus (i.e. cursor starts blinking).
      // onDidFocusEditorText

      // emitted when the text inside this editor lost focus (i.e. cursor stops blinking).
      // onDidBlurEditorText

      // emitted when the text inside this editor or an editor widget gained focus.
      // onDidFocusEditorWidget

      // emitted when the text inside this editor or an editor widget lost focus.
      // onDidBlurEditorWidget

      // event emitted on a "contextmenu".
      // onContextMenu

      // Returns true if the text inside this editor or an editor widget has focus.
      // hasWidgetFocus

      this.worker.onmessage = ({ data: { markers, version, output, fixed } }) => {
        const model = this.editor.getModel()
        if (model && model.getVersionId() === version) {
          if (fixed && output) {
            model.pushEditOperations(
              [],
              [
                {
                  range: model.getFullModelRange(),
                  text: output
                }
              ]
            )
          } else {
            monaco.editor.setModelMarkers(model, 'eslint', markers)
          }
        }
      }
    }
  }

  componentWillUnmount() {
    console.log('MonacoEditor: componentWillUnmount ', this.uuid)

    const {
      project: { releaseEditor = noop }
    } = this.props

    this.worker.terminate()
    this.subscriptions.dispose()
    if (typeof this.editor !== 'undefined') {
      releaseEditor(this.editor)
      this.editor.dispose()
    }

    this.editor = null
    this.component = null
  }

  componentDidUpdate(prevProps) {
    console.log('MonacoEditor: componentDidUpdate ', this.uuid)

    if (this.editor) {
      if (this.file !== this.props.file) {
        let viewState = this.editor.saveViewState()
        this.file.saveEditorViewState(viewState)

        this.file = this.props.file

        this.__prevent_trigger_change_event = true
        this.editor.setModel(this.file.monacoModel)
        this.__prevent_trigger_change_event = false

        viewState = this.file.getEditorViewState()
        if (viewState) {
          this.editor.restoreViewState(viewState)
        }

        this.editor.focus()
      }

      if (this.props.width !== prevProps.width || this.props.height !== prevProps.height) {
        this.editor.layout()
      }

      if (prevProps.options !== this.props.options) {
        this.editor.updateOptions(this.props.options)
      }
    }

    if (prevProps.language !== this.props.language) {
      monaco.editor.setModelLanguage(this.editor.getModel(), this.props.language)
    }

    if (prevProps.theme !== this.props.theme) {
      monaco.editor.defineTheme(this.props.theme, this.props.themeDefinition)
      monaco.editor.setTheme(this.props.theme)
    }
  }

  editorWillMount() {
    console.log('MonacoEditor: editorWillMount ', this.uuid)

    // disable the built-in linter
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true
    })

    const { editorWillMount = noop } = this.props
    const options = editorWillMount(monaco)
    return options || {}
  }

  lintCode = (autofix = false) => {
    const model = this.file.monacoModel
    // Reset the markers
    monaco.editor.setModelMarkers(model, 'eslint', [])

    // Send the code to the worker
    this.worker.postMessage({
      code: model.getValue(),
      // Unique identifier to avoid displaying outdated validation
      version: model.getVersionId(),
      autofix
    })
  }

  beautifyCode = () => {
    // const model = this.editor.getModel();
    // const code = model.getValue()
    // //const code = prettier.format(value, {...config.prettierRules, parser: "babylon", plugins});
    // const res = this.linter.verifyAndFix(value, config.eslintRules);
  }

  render() {
    return this.component
  }
}
