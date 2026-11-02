/** @jsxImportSource ../../ */
import { JSDOM } from 'jsdom'
import { useActionState, useFormStatus, useOptimistic } from '.'
import { render, useCallback, useState } from '..'

describe('Hooks', () => {
  beforeAll(() => {
    global.requestAnimationFrame = (cb) => setTimeout(cb)
  })

  let dom: JSDOM
  let root: HTMLElement
  beforeEach(() => {
    dom = new JSDOM('<html><body><div id="root"></div></body></html>', {
      runScripts: 'dangerously',
    })
    global.document = dom.window.document
    global.HTMLElement = dom.window.HTMLElement
    global.SVGElement = dom.window.SVGElement
    global.Text = dom.window.Text
    global.FormData = dom.window.FormData
    root = document.getElementById('root') as HTMLElement
  })

  describe('useActionState', () => {
    it('should return initial state', () => {
      const [state] = useActionState(() => {}, 'initial')
      expect(state).toBe('initial')
    })

    it('should return updated state', async () => {
      const action = vi.fn().mockReturnValue('updated')

      const App = () => {
        const [state, formAction] = useActionState(action, 'initial')
        return (
          <>
            <div>{state}</div>
            <form action={formAction}>
              <input type='text' name='name' value='updated' />
              <button>Submit</button>
            </form>
          </>
        )
      }

      render(<App />, root)
      expect(root.innerHTML).toBe(
        '<div>initial</div><form><input type="text" name="name" value="updated"><button>Submit</button></form>'
      )
      root.querySelector('button')?.click()
      await Promise.resolve()
      await Promise.resolve()
      expect(root.innerHTML).toBe(
        '<div>updated</div><form><input type="text" name="name" value="updated"><button>Submit</button></form>'
      )

      expect(action).toHaveBeenCalledOnce()
      const [initialState, formData] = action.mock.calls[0]
      expect(initialState).toBe('initial')
      expect(formData).toBeInstanceOf(FormData)
      expect(formData.get('name')).toBe('updated')
    })
  })

  describe('useFormStatus', () => {
    it('should return initial state', () => {
      const status = useFormStatus()
      expect(status).toEqual({
        pending: false,
        data: null,
        method: null,
        action: null,
      })
    })

    it('should return updated state', async () => {
      let formResolve: () => void = () => {}
      const formPromise = new Promise<void>((r) => (formResolve = r))
      let status: ReturnType<typeof useFormStatus> | undefined
      const Status = () => {
        status = useFormStatus()
        return null
      }
      const App = () => {
        const [, setCount] = useState(0)
        const action = useCallback(() => {
          setCount((count) => count + 1)
          return formPromise
        }, [])
        return (
          <>
            <form action={action}>
              <Status />
              <input type='text' name='name' value='updated' />
              <button>Submit</button>
            </form>
          </>
        )
      }

      render(<App />, root)
      expect(root.innerHTML).toBe(
        '<form><input type="text" name="name" value="updated"><button>Submit</button></form>'
      )
      root.querySelector('button')?.click()
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
      expect(status).toEqual({
        pending: true,
        data: expect.any(FormData),
        method: 'post',
        action: expect.any(Function),
      })
      formResolve?.()
      await Promise.resolve()
      await Promise.resolve()
      expect(status).toEqual({
        pending: false,
        data: null,
        method: null,
        action: null,
      })
    })

    it('should reset pending state when async action rejects', async () => {
      let formReject: (reason?: unknown) => void = () => {}
      const formPromise = new Promise<void>((_, r) => (formReject = r))
      let status: ReturnType<typeof useFormStatus> | undefined
      const Status = () => {
        status = useFormStatus()
        return null
      }
      const App = () => {
        const action = useCallback(() => formPromise, [])
        return (
          <form action={action}>
            <Status />
            <input type='text' name='name' value='updated' />
            <button>Submit</button>
          </form>
        )
      }

      render(<App />, root)
      root.querySelector('button')?.click()
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
      expect(status).toEqual({
        pending: true,
        data: expect.any(FormData),
        method: 'post',
        action: expect.any(Function),
      })
      formReject(new Error('action failed'))
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
      expect(status).toEqual({
        pending: false,
        data: null,
        method: null,
        action: null,
      })
    })
  })

  describe('useOptimistic', () => {
    it('should return updated state', async () => {
      let formResolve: () => void = () => {}
      const formPromise = new Promise<void>((r) => (formResolve = r))
      const App = () => {
        const [count, setCount] = useState(0)
        const [optimisticCount, setOptimisticCount] = useOptimistic(count, (_c, n: number) => n)
        const action = useCallback(async () => {
          setOptimisticCount(count + 1)
          await formPromise
          setCount((count) => count + 2)
        }, [])

        return (
          <>
            <form action={action}>
              <div>{optimisticCount}</div>
              <input type='text' name='name' value='updated' />
              <button>Submit</button>
            </form>
          </>
        )
      }

      render(<App />, root)
      expect(root.innerHTML).toBe(
        '<form><div>0</div><input type="text" name="name" value="updated"><button>Submit</button></form>'
      )
      root.querySelector('button')?.click()
      await Promise.resolve()
      expect(root.innerHTML).toBe(
        '<form><div>1</div><input type="text" name="name" value="updated"><button>Submit</button></form>'
      )
      formResolve?.()
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
      expect(root.innerHTML).toBe(
        '<form><div>2</div><input type="text" name="name" value="updated"><button>Submit</button></form>'
      )
    })

    it('should revert to original state when async action rejects', async () => {
      let formReject: (reason?: unknown) => void = () => {}
      const formPromise = new Promise<void>((_, r) => (formReject = r))
      const App = () => {
        const [count] = useState(0)
        const [optimisticCount, setOptimisticCount] = useOptimistic(count, (_c, n: number) => n)
        const action = useCallback(async () => {
          setOptimisticCount(count + 1)
          await formPromise
        }, [])

        return (
          <form action={action}>
            <div>{optimisticCount}</div>
            <button>Submit</button>
          </form>
        )
      }

      render(<App />, root)
      expect(root.innerHTML).toBe('<form><div>0</div><button>Submit</button></form>')
      root.querySelector('button')?.click()
      await Promise.resolve()
      expect(root.innerHTML).toBe('<form><div>1</div><button>Submit</button></form>')
      formReject(new Error('failed'))
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
      expect(root.innerHTML).toBe('<form><div>0</div><button>Submit</button></form>')
    })

    it('should wait for all actions to settle when one action rejects', async () => {
      let rejectFirst: (reason?: unknown) => void = () => {}
      let resolveSecond: () => void = () => {}
      const firstPromise = new Promise<void>((_, r) => (rejectFirst = r))
      const secondPromise = new Promise<void>((r) => (resolveSecond = r))
      let callCount = 0
      const App = () => {
        const [count] = useState(0)
        const [optimisticCount, setOptimisticCount] = useOptimistic(count, (_c, n: number) => n)
        const action = useCallback(async () => {
          callCount++
          setOptimisticCount(callCount)
          await (callCount === 1 ? firstPromise : secondPromise)
        }, [])

        return (
          <form action={action}>
            <div>{optimisticCount}</div>
            <button>Submit</button>
          </form>
        )
      }

      render(<App />, root)
      expect(root.innerHTML).toBe('<form><div>0</div><button>Submit</button></form>')
      root.querySelector('button')?.click()
      await Promise.resolve()
      expect(root.innerHTML).toBe('<form><div>1</div><button>Submit</button></form>')
      root.querySelector('button')?.click()
      await Promise.resolve()
      expect(root.innerHTML).toBe('<form><div>2</div><button>Submit</button></form>')

      rejectFirst(new Error('first failed'))
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
      expect(root.innerHTML).toBe('<form><div>2</div><button>Submit</button></form>')

      resolveSecond()
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
      expect(root.innerHTML).toBe('<form><div>0</div><button>Submit</button></form>')
    })
  })
})
