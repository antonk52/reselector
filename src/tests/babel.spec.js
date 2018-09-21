import React from 'react'
import { transformFileSync } from '@babel/core'
import { mount } from 'enzyme'

import {
  ClassComponent,
  ArrowFunctionalComponent,
  FunctionalComponent,
  ComposedComponent,
  ComponentWithAttrs,
} from './App'
import defaultNamedClassComponent from './App/defaultNamedClassExport'
import defaultDeclaredNamedClassComponent from './App/defaultDeclaredNamedClassExport'
import { select } from '../'

describe('babel plugin', () => {
  describe('transform', () => {
    let config = {}

    beforeEach(() => {
      config = {}

      jest.doMock('../config', () => new Proxy(jest.requireActual('../config'), {
        get: (target, value) => (value in config ? config[value] : target[value]),
      }))
    })

    it('should transform source code well for development', () => {
      const { code } = transformFileSync(require.resolve('./App'))

      expect(code).toMatchSnapshot()
    })

    it('should transform source code depends on the env option', () => {
      config.env = true

      const { code } = transformFileSync(require.resolve('./App'))

      expect(code).toMatchSnapshot()
    })

    it('should transform default anonymous function', () => {
      const { code } = transformFileSync(require.resolve('./App/defaultAnonymousFunctionExport'))

      expect(code).toMatchSnapshot()
    })

    it('should transform default named function', () => {
      const { code } = transformFileSync(require.resolve('./App/defaultNamedFunctionExport'))

      expect(code).toMatchSnapshot()
    })

    it('should transform default named class', () => {
      const { code } = transformFileSync(require.resolve('./App/defaultNamedClassExport'))

      expect(code).toMatchSnapshot()
    })

    it('should transform declared named class in default', () => {
      const { code } = transformFileSync(require.resolve('./App/defaultDeclaredNamedClassExport'))

      expect(code).toMatchSnapshot()
    })

    it('should transform conditionals functions', () => {
      const { code } = transformFileSync(require.resolve('./App/conditionalRenderComponents'))

      expect(code).toMatchSnapshot()
    })
  })

  it('should find all the types of Components', () => {
    const components = [
      ClassComponent,
      ArrowFunctionalComponent,
      FunctionalComponent,
      ComposedComponent,
      ComponentWithAttrs,
      defaultNamedClassComponent,
      defaultDeclaredNamedClassComponent,
    ]

    components.forEach((Component) => {
      const wrapper = mount(<div><Component /></div>)

      const selector = select`${Component}`

      expect(wrapper).toMatchSnapshot()
      expect(wrapper.find(selector).hostNodes().length).toBe(1)
    })
  })

  it('should save Component`s root attrs', () => {
    const wrapper = mount(<ComponentWithAttrs />)
    const selector = select`${ComponentWithAttrs}`

    expect(wrapper).toMatchSnapshot()
    expect(wrapper.find(selector).getDOMNode().dataset).toMatchSnapshot()
  })

  it('should find nested Component', () => {
    const wrapper = mount((
      <ClassComponent>
        <ArrowFunctionalComponent>
          <FunctionalComponent>
            <ComposedComponent />
          </FunctionalComponent>
        </ArrowFunctionalComponent>
      </ClassComponent>
    ))

    const selector = select`
      ${ClassComponent}
      ${ArrowFunctionalComponent}
      ${FunctionalComponent}
      ${ComposedComponent}
    `

    expect(wrapper).toMatchSnapshot()
    expect(wrapper.find(selector).hostNodes().length).toBe(1)
  })

  it('should skip React.Fragment', () => {
    const { code } = transformFileSync(require.resolve('./App/reactFragment'))

    expect(code).toMatchSnapshot()

    const { A, B } = require('./App/reactFragment')

    const wrappers = [mount(<A />), mount(<B />)]

    wrappers.forEach((wrapper) => {
      expect(wrapper.childAt(0).props()).toEqual({})
    })
  })
})
