import Linter from 'eslint4b'
const linter = new Linter()

import eslintRules from './eslint_rules'

self.onmessage = ({ data: { code, version, autofix = false } }) => {
  let markers
  try {
    if (autofix) {
      const { fixed, output, messages } = linter.verifyAndFix(code, eslintRules)

      markers = messages.map(err => ({
        startLineNumber: err.line,
        endLineNumber: err.line,
        startColumn: err.column,
        endColumn: err.column,
        message: `${err.message} (${err.ruleId})`,
        severity: 3,
        source: 'ESLint'
      }))

      self.postMessage({ markers, version, output, fixed })
    } else {
      markers = linter.verify(code, eslintRules).map(err => ({
        startLineNumber: err.line,
        endLineNumber: err.line,
        startColumn: err.column,
        endColumn: err.column,
        message: `${err.message} (${err.ruleId})`,
        severity: 3,
        source: 'ESLint'
      }))

      self.postMessage({ markers, version })
    }
  } catch (e) {
    /* Ignore error */
  }
}
