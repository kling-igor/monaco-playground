import React, { Component } from 'react'
import ResizeDetector from 'react-resize-detector'
import styled, { createGlobalStyle } from 'styled-components'
import dedent from 'dedent-preserving-indents'
// https://blog.expo.io/building-a-code-editor-with-monaco-f84b3a06deaf
// react-monaco-editor
import { MonacoEditor } from './renderer/components/texteditor/monaco'

import { observable, action, computed } from 'mobx'
import { observer } from 'mobx-react'

import { File } from './renderer/file'

// https://github.com/Microsoft/vscode/blob/master/src/vs/editor/standalone/common/themes.ts#L13
// https://github.com/brijeshb42/monaco-themes

import Monokai from './renderer/themes/editor/Monokai.json'

const GlobalStyle = createGlobalStyle`
  html {
    
    height: 100%;
    margin: 0;
  }

  body {
    padding: 0;
    margin: 0;
    font-family: Roboto, sans-serif;
    overflow: hidden;
    background-color: white;
    height: 100%;
    margin: 0;
    overflow: hidden !important;
  }

  #app {
    min-height: 100%;
    position: fixed;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
  }
`

const file1Content = dedent`
class A {
  constructor() {

  }
}
`

const file2Content = dedent`
console.log('HELLO WORLD')
`

const options = {
  selectOnLineNumbers: true
}

const ContainerStyle = styled.div`
  height: 100%;
  min-height: 100%;
  overflow: hidden;
  background-color: white;
  display: flex;
  flex-direction: column;
`

const EditorPane = styled.div`
  position: relative;
  top: 0px;
  left: 0px;
  height: calc(100% - 48px);
  width: 100%;
  right: 0px;
  bottom: 0px;
  background-color: white;
  /* box-shadow: inset 0px 20px 20px -30px black; */
`

const ToolbarStyle = styled.div`
  height: 48px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  background-color: yellow;
`

class Project {
  @observable.ref openedFiles = []

  @observable currentFileIndex = -1

  constructor() {
    this.openedFiles = [
      new File('/some/file1.js', file1Content.join('\n')),
      new File('/some/file2.js', file2Content.join('\n'))
    ]

    this.currentFileIndex = 0
  }

  @action.bound
  changeFile(index) {
    if (index == this.currentFileIndex) return
    console.log(index)
    this.currentFileIndex = index
  }

  @computed
  get currentFile() {
    return this.openedFiles[this.currentFileIndex]
  }
}

const project = new Project()

@observer
class EditorView extends Component {
  textEditorDidMount = (editor, monaco) => {
    // брать theme из props
    monaco.editor.defineTheme('Monokai', Monokai)
    monaco.editor.setTheme('Monokai')
    editor.focus()
  }

  onTextChange = text => {
    file.setDirty()
  }

  render() {
    const {
      project: { currentFile }
    } = this.props

    return (
      <EditorPane>
        <ResizeDetector
          handleWidth
          handleHeight
          render={({ width, height }) => {
            return (
              <MonacoEditor
                key="monacoeditor"
                width={width}
                height={height}
                language="javascript"
                file={currentFile}
                options={options}
                onChange={this.onTextChange}
                editorDidMount={this.textEditorDidMount}
              />
            )
          }}
        />
      </EditorPane>
    )
  }
}

@observer
export default class App extends Component {
  render() {
    return (
      <>
        <GlobalStyle />
        <ContainerStyle>
          <ToolbarStyle>
            <p
              onClick={() => {
                project.changeFile(0)
              }}
            >
              file1.js
            </p>
            &nbsp;
            <p
              onClick={() => {
                project.changeFile(1)
              }}
            >
              file2.js
            </p>
          </ToolbarStyle>
          <EditorView project={project} />
        </ContainerStyle>
      </>
    )
  }
}
