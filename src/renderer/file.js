import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import path from 'path'
import { observable, computed, action } from 'mobx'

// import { hashlessFileName } from './utils'

// модель открытого файла

export class File {
  @observable filePath = null

  @computed get fileName() {
    // const baseName = path.basename(this.filePath)
    // return hashlessFileName(baseName)
    return 'FAKE.js'
  }

  @observable dirty = false

  // невосприимчивость к изменениям на момент сохранения
  @observable isFrozen = false

  constructor(filePath, buffer, language = 'javascript') {
    this.filePath = filePath

    this.monacoModel = monaco.editor.createModel(buffer, language)
    this.monacoModel.updateOptions({ tabSize: 2 })
  }

  saveEditorViewState(monacoViewState) {
    this.monacoViewState = monacoViewState
  }

  getEditorViewState() {
    return this.monacoViewState
  }

  get buffer() {
    return this.monacoModel.getValue()
  }

  @action.bound
  setBuffer(text) {
    if (this.isFrozen) return
    this.monacoModel.setValue(text)
    this.dirty = true
  }

  @action.bound
  setDirty() {
    this.dirty = true
  }

  // заглушка
  @action.bound
  save(projectPath, save) {
    if (!this.dirty) {
      return
    }

    if (this.isFrozen) {
      return
    }

    const savingPath = path.join(projectPath, this.filePath)

    this.isFrozen = true

    save(savingPath, this.buffer)
      .then(() => {
        this.isFrozen = false
        this.dirty = false
      })
      .catch(e => {
        this.isFrozen = false
        console.log(`UNABLE TO SAVE '${savingPath}':`, e)
      })
  }
}
