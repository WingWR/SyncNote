import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeAll } from 'vitest'
import ShareLink from '../document/ShareLink.vue'

// @vitest-environment jsdom

describe('ShareLink.vue', () => {
  const documentId = '12345'
  const baseUrl = 'http://localhost:3000'

  beforeAll(() => {
    Object.defineProperty(window, 'location', {
      value: {
        origin: baseUrl
      }
    })
    
    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined)
      }
    })
    
    // Mock alert
    window.alert = vi.fn()
  })

  it('renders correctly when visible is true', () => {
    const wrapper = mount(ShareLink, {
      props: {
        visible: true,
        documentId
      }
    })
    
    expect(wrapper.find('.fixed.inset-0').exists()).toBe(true)
    expect(wrapper.text()).toContain('分享文档')
    expect(wrapper.find('input').element.value).toBe(`${baseUrl}/home/document/join/${documentId}`)
  })

  it('does not render when visible is false', () => {
    const wrapper = mount(ShareLink, {
      props: {
        visible: false,
        documentId
      }
    })
    
    expect(wrapper.find('.fixed.inset-0').exists()).toBe(false)
  })

  it('emits update:visible and close events when close button is clicked', async () => {
    const wrapper = mount(ShareLink, {
      props: {
        visible: true,
        documentId
      }
    })
    
    // Find close button (the '关闭' button at bottom)
    const closeButtons = wrapper.findAll('button')
    const bottomCloseButton = closeButtons[closeButtons.length - 1]
    
    if (bottomCloseButton) {
      await bottomCloseButton.trigger('click')
    }
    
    expect(wrapper.emitted('update:visible')).toBeTruthy()
    expect(wrapper.emitted('update:visible')![0]).toEqual([false])
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('copies link to clipboard when copy button is clicked', async () => {
    const wrapper = mount(ShareLink, {
      props: {
        visible: true,
        documentId
      }
    })
    
    const copyButton = wrapper.findAll('button').find(b => b.text() === '复制链接')
    await copyButton?.trigger('click')
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(`${baseUrl}/home/document/join/${documentId}`)
  })
})
