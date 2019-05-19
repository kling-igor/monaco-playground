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

import Active4D from './renderer/themes/editor/Active4D.json'
import AllHallowsEve from './renderer/themes/editor/All Hallows Eve.json'
import Amy from './renderer/themes/editor/Amy.json'
import Blackboard from './renderer/themes/editor/Blackboard.json'
import BrillianceBlack from './renderer/themes/editor/Brilliance Black.json'
import BrillianceDull from './renderer/themes/editor/Brilliance Dull.json'
import ChromeDevTools from './renderer/themes/editor/Chrome DevTools.json'
import CloudsMidnight from './renderer/themes/editor/Clouds Midnight.json'
import Clouds from './renderer/themes/editor/Clouds.json'
import Cobalt from './renderer/themes/editor/Cobalt.json'
import Dawn from './renderer/themes/editor/Dawn.json'
import Dreamweaver from './renderer/themes/editor/Dreamweaver.json'
import Eiffel from './renderer/themes/editor/Eiffel.json'
import EspressoLibre from './renderer/themes/editor/Espresso Libre.json'
import GitHub from './renderer/themes/editor/GitHub.json'
import IDLE from './renderer/themes/editor/IDLE.json'
import Katzenmilch from './renderer/themes/editor/Katzenmilch.json'
import KuroirTheme from './renderer/themes/editor/Kuroir Theme.json'
import LAZY from './renderer/themes/editor/LAZY.json'
import MagicWB_Amiga from './renderer/themes/editor/MagicWB (Amiga).json'
import Merbivore_Soft from './renderer/themes/editor/Merbivore Soft.json'
import Merbivore from './renderer/themes/editor/Merbivore.json'
import Monokai from './renderer/themes/editor/Monokai.json'
import PastelsOnDark from './renderer/themes/editor/Pastels on Dark.json'
import SlushAndPoppies from './renderer/themes/editor/Slush and Poppies.json'
import SolarizedDark from './renderer/themes/editor/Solarized-dark.json'
import SolarizedLight from './renderer/themes/editor/Solarized-light.json'
import SpaceCadet from './renderer/themes/editor/SpaceCadet.json'
import Sunburst from './renderer/themes/editor/Sunburst.json'
import Textmate_Mac_Classic from './renderer/themes/editor/Textmate (Mac Classic).json'
import TomorrowNightBlue from './renderer/themes/editor/Tomorrow-Night-Blue.json'
import TomorrowNightBright from './renderer/themes/editor/Tomorrow-Night-Bright.json'
import TomorrowNightEighties from './renderer/themes/editor/Tomorrow-Night-Eighties.json'
import TomorrowNight from './renderer/themes/editor/Tomorrow-Night.json'
import Tomorrow from './renderer/themes/editor/Tomorrow.json'
import Twilight from './renderer/themes/editor/Twilight.json'
import VibrantInk from './renderer/themes/editor/Vibrant Ink.json'
import Xcode_default from './renderer/themes/editor/Xcode_default.json'
import Zenburnesque from './renderer/themes/editor/Zenburnesque.json'
import iPlastic from './renderer/themes/editor/iPlastic.json'
import idleFingers from './renderer/themes/editor/idleFingers.json'
import krTheme from './renderer/themes/editor/krTheme.json'
import monoindustrial from './renderer/themes/editor/monoindustrial.json'

const themes = [
  { name: 'Monokai', definition: Monokai },
  { name: 'Active4D', definition: Active4D },
  { name: 'AllHallowsEve', definition: AllHallowsEve },
  { name: 'Amy', definition: Amy },
  { name: 'Blackboard', definition: Blackboard },
  { name: 'BrillianceBlack', definition: BrillianceBlack },
  { name: 'BrillianceDull', definition: BrillianceDull },
  { name: 'ChromeDevTools', definition: ChromeDevTools },
  { name: 'CloudsMidnight', definition: CloudsMidnight },
  { name: 'Clouds', definition: Clouds },
  { name: 'Cobalt', definition: Cobalt },
  { name: 'Dawn', definition: Dawn },
  { name: 'Dreamweaver', definition: Dreamweaver },
  { name: 'Eiffel', definition: Eiffel },
  { name: 'EspressoLibre', definition: EspressoLibre },
  { name: 'GitHub', definition: GitHub },
  { name: 'IDLE', definition: IDLE },
  { name: 'iPlastic', definition: iPlastic },
  { name: 'idleFingers', definition: idleFingers },
  { name: 'Katzenmilch', definition: Katzenmilch },
  { name: 'KuroirTheme', definition: KuroirTheme },
  { name: 'krTheme', definition: krTheme },
  { name: 'LAZY', definition: LAZY },
  { name: 'MagicWBAmiga', definition: MagicWB_Amiga },
  { name: 'MerbivoreSoft', definition: Merbivore_Soft },
  { name: 'Merbivore', definition: Merbivore },
  { name: 'Monoindustrial', definition: monoindustrial },
  { name: 'PastelsOnDark', definition: PastelsOnDark },
  { name: 'SlushAndPoppies', definition: SlushAndPoppies },
  { name: 'SolarizedDark', definition: SolarizedDark },
  { name: 'SolarizedLight', definition: SolarizedLight },
  { name: 'SpaceCadet', definition: SpaceCadet },
  { name: 'Sunburst', definition: Sunburst },
  { name: 'TextmateMacClassic', definition: Textmate_Mac_Classic },
  { name: 'TomorrowNightBlue', definition: TomorrowNightBlue },
  { name: 'TomorrowNightBright', definition: TomorrowNightBright },
  { name: 'TomorrowNightEighties', definition: TomorrowNightEighties },
  { name: 'TomorrowNight', definition: TomorrowNight },
  { name: 'Tomorrow', definition: Tomorrow },
  { name: 'Twilight', definition: Twilight },
  { name: 'VibrantInk', definition: VibrantInk },
  { name: 'XcodeDefault', definition: Xcode_default },
  { name: 'Zenburnesque', definition: Zenburnesque }
]

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
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  background-color: yellow;
`

class Project {
  @observable.ref theme = themes[0]

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

  @action.bound
  setDirtyCurrentFile() {
    this.currentFile.dirty = true
  }

  @action
  setTheme(name) {
    const theme = themes.find(item => item.name === name)
    if (theme) {
      this.theme = theme
    }
  }
}

const project = new Project()

@observer
class EditorView extends Component {
  // textEditorDidMount = (editor, monaco) => {
  //   // брать theme из props
  //   monaco.editor.defineTheme('Monokai', Monokai)
  //   monaco.editor.setTheme('Monokai')
  //   editor.focus()
  // }

  onTextChange = text => {
    this.props.project.setDirtyCurrentFile()
  }

  render() {
    const {
      project: { currentFile, theme }
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
                theme={theme.name}
                themeDefinition={theme.definition}
                onChange={this.onTextChange}
              />
            )
          }}
        />
      </EditorPane>
    )
  }
}

@observer
class ToolBar extends Component {
  handleThemeSelect = event => {
    // this.setState({ theme: event.target.value })
    this.props.project.setTheme(event.target.value)
  }

  render() {
    const {
      project: { changeFile, openedFiles }
    } = this.props

    return (
      <ToolbarStyle>
        <ul>
          {openedFiles.map((file, index) => {
            const { filePath, dirty } = file
            return (
              <li
                key={filePath}
                style={{
                  display: 'inline-block',
                  marginLeft: '10px',
                  marginRight: '10px'
                }}
              >
                <p
                  onClick={() => {
                    changeFile(index)
                  }}
                  style={{ color: dirty ? 'red' : 'black' }}
                >
                  {filePath}
                </p>
                &nbsp;
              </li>
            )
          })}
        </ul>
        <select defaultValue={this.props.project.theme.name} onChange={this.handleThemeSelect}>
          {themes.map(({ name }) => {
            return (
              <option key={name} value={name}>
                {name}
              </option>
            )
          })}
        </select>
      </ToolbarStyle>
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
          <ToolBar project={project} />
          <EditorView project={project} />
        </ContainerStyle>
      </>
    )
  }
}
