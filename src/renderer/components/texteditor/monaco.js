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
  // state = {file:null, theme:null}

  // static getDerivedStateFromProps(newProps, oldState) {
  //   let state = {}

  //   if (oldState.file !== newProps.file) {
  //     state.file = newProps.file
  //   }

  //   return state
  // }

  component = null

  constructor(props) {
    super(props)

    this.uuid = uuidv4()

    console.log('MonacoEditor: ctor ', this.uuid)

    // this.state = {file: props.file}

    this.file = props.file

    this.containerRef = React.createRef()

    this.subscriptions = new CompositeDisposable()

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

      this.__prevent_trigger_change_event = true
      this.editor.setModel(this.file.monacoModel)
      this.__prevent_trigger_change_event = false

      const { editorDidMount = noop, onChange = noop } = this.props

      editorDidMount(this.editor, monaco)

      this.throttledLinting = debounce(this.lintCode, 1000)

      // emitted when the content of the current model has changed.
      this.subscriptions.add(
        this.editor.onDidChangeModelContent(event => {
          // Only invoking when user input changed
          if (!this.__prevent_trigger_change_event) {
            onChange(this.file.monacoModel.getValue(), event)
            this.throttledLinting()
          }
        })
      )

      // emitted when the cursor position has changed.
      // onDidChangeCursorPosition

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

      this.worker.onmessage = ({ data: { markers, version, output } }) => {
        const model = this.editor.getModel()
        if (model && model.getVersionId() === version) {
          // model.pushEditOperations(
          //   [],
          //   [
          //     {
          //       range: model.getFullModelRange(),
          //       text: output
          //     }
          //   ]
          // );
          monaco.editor.setModelMarkers(model, 'eslint', markers)
        }
      }
    }
  }

  componentWillUnmount() {
    console.log('MonacoEditor: componentWillUnmount ', this.uuid)

    this.worker.terminate()
    this.subscriptions.dispose()
    if (typeof this.editor !== 'undefined') {
      this.editor.dispose()
    }

    this.component = null
  }

  componentDidUpdate(prevProps) {
    console.log('MonacoEditor: componentDidUpdate ', this.uuid)

    if (this.file !== this.props.file) {
      if (this.editor) {
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
    }

    if (prevProps.language !== this.props.language) {
      monaco.editor.setModelLanguage(this.editor.getModel(), this.props.language)
    }

    if (prevProps.theme !== this.props.theme) {
      monaco.editor.setTheme(this.props.theme)
    }

    if (this.editor && (this.props.width !== prevProps.width || this.props.height !== prevProps.height)) {
      this.editor.layout()
    }

    if (prevProps.options !== this.props.options) {
      this.editor.updateOptions(this.props.options)
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

  lintCode = () => {
    // const model = this.editor.getModel();

    const model = this.file.monacoModel

    // Reset the markers
    monaco.editor.setModelMarkers(model, 'eslint', [])

    // Send the code to the worker
    this.worker.postMessage({
      code: model.getValue(),
      // Unique identifier to avoid displaying outdated validation
      version: model.getVersionId()
    })
  }

  beautifyCode = () => {
    // const model = this.editor.getModel();
    // const code = model.getValue()
    // //const code = prettier.format(value, {...config.prettierRules, parser: "babylon", plugins});
    // const res = this.linter.verifyAndFix(value, config.eslintRules);
  }

  render() {
    console.log('MonacoEditor: render ', this.uuid)

    // const { width = '100%', height = '100%' } = this.props
    // const style = {
    //   width: processSize(width),
    //   height: processSize(height)
    // }

    // return React.createElement('div', {
    //   ref: this.containerRef,
    //   style: style,
    //   className: 'react-monaco-editor-container'
    // })
    // return <RootStyle className="react-monaco-editor-container" ref={this.containerRef} />
    return this.component
  }
}
