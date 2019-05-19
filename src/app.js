import React, { PureComponent } from 'react'
import ResizeDetector from 'react-resize-detector'
import styled, { createGlobalStyle } from 'styled-components'
import dedent from 'dedent-preserving-indents'
// https://blog.expo.io/building-a-code-editor-with-monaco-f84b3a06deaf
// react-monaco-editor
import { MonacoEditor } from './renderer/components/texteditor/monaco'

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

const fileContent = dedent`
class A {
  constructor() {

  }
}
`
const file = new File('/some/path.js', fileContent.join('\n'))

const options = {
  selectOnLineNumbers: true
}

const ContainerStyle = styled.div`
  height: 100%;
  min-height: 100%;
  overflow: hidden;
  background-color: white;
`

const EditorPane = styled.div`
  position: relative;
  top: 0px;
  left: 0px;
  height: 100%;
  width: 100%;
  right: 0px;
  bottom: 0px;
  background-color: white;
  /* box-shadow: inset 0px 20px 20px -30px black; */
`

export default class App extends PureComponent {
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
    return (
      <>
        <GlobalStyle />
        <ContainerStyle>
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
                    file={file}
                    options={options}
                    onChange={this.onTextChange}
                    editorDidMount={this.textEditorDidMount}
                  />
                )
              }}
            />
          </EditorPane>
        </ContainerStyle>
      </>
    )
  }
}
