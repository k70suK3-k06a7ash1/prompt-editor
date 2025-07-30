import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useGeneratePrompt } from './use-generate-prompt'

/**
 * Test suite for the useGeneratePrompt custom hook
 * 
 * This hook generates a final prompt by replacing variables in ${variableName} format
 * with their corresponding values from a variableValues object.
 */
describe('useGeneratePrompt', () => {
  // Mock state setter function
  let mockSetGeneratedPrompt: ReturnType<typeof vi.fn>

  beforeEach(() => {
    // Reset mock before each test
    mockSetGeneratedPrompt = vi.fn()
  })

  describe('Basic prompt generation', () => {
    it('should generate prompt with single variable replacement', () => {
      const originalPrompt = 'Hello ${name}!'
      const variableValues = { name: 'John' }
      
      renderHook(() => useGeneratePrompt({
        originalPrompt,
        variableValues,
        setGeneratedPrompt: mockSetGeneratedPrompt
      }))

      expect(mockSetGeneratedPrompt).toHaveBeenCalledWith('Hello John!')
    })

    it('should generate prompt with multiple variable replacements', () => {
      const originalPrompt = 'Hello ${name}, you are ${age} years old and work as a ${job}.'
      const variableValues = { 
        name: 'Alice', 
        age: '30', 
        job: 'Developer' 
      }
      
      renderHook(() => useGeneratePrompt({
        originalPrompt,
        variableValues,
        setGeneratedPrompt: mockSetGeneratedPrompt
      }))

      expect(mockSetGeneratedPrompt).toHaveBeenCalledWith('Hello Alice, you are 30 years old and work as a Developer.')
    })

    it('should replace duplicate variables correctly', () => {
      const originalPrompt = 'Hello ${name}, nice to meet you ${name}! Your name ${name} is beautiful.'
      const variableValues = { name: 'Sarah' }
      
      renderHook(() => useGeneratePrompt({
        originalPrompt,
        variableValues,
        setGeneratedPrompt: mockSetGeneratedPrompt
      }))

      expect(mockSetGeneratedPrompt).toHaveBeenCalledWith('Hello Sarah, nice to meet you Sarah! Your name Sarah is beautiful.')
    })

    it('should handle variables with underscores and numbers', () => {
      const originalPrompt = 'User ${user_id} has ${item_count} items and ${total_amount} dollars.'
      const variableValues = { 
        user_id: '12345', 
        item_count: '42', 
        total_amount: '99.99' 
      }
      
      renderHook(() => useGeneratePrompt({
        originalPrompt,
        variableValues,
        setGeneratedPrompt: mockSetGeneratedPrompt
      }))

      expect(mockSetGeneratedPrompt).toHaveBeenCalledWith('User 12345 has 42 items and 99.99 dollars.')
    })
  })

  describe('Handling missing values', () => {
    it('should keep original variable format when value is empty string', () => {
      const originalPrompt = 'Hello ${name}!'
      const variableValues = { name: '' }
      
      renderHook(() => useGeneratePrompt({
        originalPrompt,
        variableValues,
        setGeneratedPrompt: mockSetGeneratedPrompt
      }))

      expect(mockSetGeneratedPrompt).toHaveBeenCalledWith('Hello ${name}!')
    })

    it('should keep original variable format when value is missing', () => {
      const originalPrompt = 'Hello ${name} and ${age}!'
      const variableValues = { name: 'John' } // age is missing
      
      renderHook(() => useGeneratePrompt({
        originalPrompt,
        variableValues,
        setGeneratedPrompt: mockSetGeneratedPrompt
      }))

      expect(mockSetGeneratedPrompt).toHaveBeenCalledWith('Hello John and ${age}!')
    })

    it('should handle mixed filled and empty values', () => {
      const originalPrompt = 'Name: ${name}, Age: ${age}, City: ${city}'
      const variableValues = { 
        name: 'Bob', 
        age: '', 
        city: 'New York' 
      }
      
      renderHook(() => useGeneratePrompt({
        originalPrompt,
        variableValues,
        setGeneratedPrompt: mockSetGeneratedPrompt
      }))

      expect(mockSetGeneratedPrompt).toHaveBeenCalledWith('Name: Bob, Age: ${age}, City: New York')
    })

    it('should handle completely empty variableValues object', () => {
      const originalPrompt = 'Hello ${name} and ${age}!'
      const variableValues = {}
      
      renderHook(() => useGeneratePrompt({
        originalPrompt,
        variableValues,
        setGeneratedPrompt: mockSetGeneratedPrompt
      }))

      expect(mockSetGeneratedPrompt).toHaveBeenCalledWith('Hello ${name} and ${age}!')
    })
  })

  describe('Edge cases', () => {
    it('should clear generated prompt when originalPrompt is empty', () => {
      const originalPrompt = ''
      const variableValues = { name: 'John' }
      
      renderHook(() => useGeneratePrompt({
        originalPrompt,
        variableValues,
        setGeneratedPrompt: mockSetGeneratedPrompt
      }))

      expect(mockSetGeneratedPrompt).toHaveBeenCalledWith('')
    })

    it('should handle prompt with no variables', () => {
      const originalPrompt = 'This is a plain text prompt with no variables.'
      const variableValues = { name: 'John' }
      
      renderHook(() => useGeneratePrompt({
        originalPrompt,
        variableValues,
        setGeneratedPrompt: mockSetGeneratedPrompt
      }))

      expect(mockSetGeneratedPrompt).toHaveBeenCalledWith('This is a plain text prompt with no variables.')
    })

    it('should handle multiline prompts', () => {
      const originalPrompt = `Hello \${name},
        
        Your age is \${age} and you live in \${city}.
        Thank you for using our service!`
      const variableValues = { 
        name: 'Emma', 
        age: '28', 
        city: 'London' 
      }
      
      renderHook(() => useGeneratePrompt({
        originalPrompt,
        variableValues,
        setGeneratedPrompt: mockSetGeneratedPrompt
      }))

      const expectedResult = `Hello Emma,
        
        Your age is 28 and you live in London.
        Thank you for using our service!`
      
      expect(mockSetGeneratedPrompt).toHaveBeenCalledWith(expectedResult)
    })

    it('should handle special characters in variable values', () => {
      const originalPrompt = 'Message: ${message}, Email: ${email}'
      const variableValues = { 
        message: 'Hello! How are you? 😊', 
        email: 'user@example.com' 
      }
      
      renderHook(() => useGeneratePrompt({
        originalPrompt,
        variableValues,
        setGeneratedPrompt: mockSetGeneratedPrompt
      }))

      expect(mockSetGeneratedPrompt).toHaveBeenCalledWith('Message: Hello! How are you? 😊, Email: user@example.com')
    })

    it('should handle very long variable values', () => {
      const originalPrompt = 'Description: ${description}'
      const longDescription = 'A'.repeat(1000)
      const variableValues = { description: longDescription }
      
      renderHook(() => useGeneratePrompt({
        originalPrompt,
        variableValues,
        setGeneratedPrompt: mockSetGeneratedPrompt
      }))

      expect(mockSetGeneratedPrompt).toHaveBeenCalledWith(`Description: ${longDescription}`)
    })
  })

  describe('Hook re-execution behavior', () => {
    it('should re-execute when originalPrompt changes', () => {
      const variableValues = { name: 'John' }
      
      const { rerender } = renderHook(
        ({ prompt }) => useGeneratePrompt({
          originalPrompt: prompt,
          variableValues,
          setGeneratedPrompt: mockSetGeneratedPrompt
        }),
        { initialProps: { prompt: 'Hello ${name}!' } }
      )

      // Initial call
      expect(mockSetGeneratedPrompt).toHaveBeenCalledTimes(1)
      expect(mockSetGeneratedPrompt).toHaveBeenCalledWith('Hello John!')

      // Clear mock and rerender with new prompt
      mockSetGeneratedPrompt.mockClear()
      
      rerender({ prompt: 'Hi ${name}, welcome!' })

      // Should be called again with new generated prompt
      expect(mockSetGeneratedPrompt).toHaveBeenCalledTimes(1)
      expect(mockSetGeneratedPrompt).toHaveBeenCalledWith('Hi John, welcome!')
    })

    it('should re-execute when variableValues changes', () => {
      const originalPrompt = 'Hello ${name}!'
      
      const { rerender } = renderHook(
        ({ values }) => useGeneratePrompt({
          originalPrompt,
          variableValues: values,
          setGeneratedPrompt: mockSetGeneratedPrompt
        }),
        { initialProps: { values: { name: 'John' } } }
      )

      // Initial call
      expect(mockSetGeneratedPrompt).toHaveBeenCalledTimes(1)
      expect(mockSetGeneratedPrompt).toHaveBeenCalledWith('Hello John!')

      // Clear mock and rerender with new values
      mockSetGeneratedPrompt.mockClear()
      
      rerender({ values: { name: 'Jane' } })

      // Should be called again with new generated prompt
      expect(mockSetGeneratedPrompt).toHaveBeenCalledTimes(1)
      expect(mockSetGeneratedPrompt).toHaveBeenCalledWith('Hello Jane!')
    })

    it('should not re-execute when setter function changes (stable reference)', () => {
      const newSetGeneratedPrompt = vi.fn()
      
      const { rerender } = renderHook(
        ({ setter }) => useGeneratePrompt({
          originalPrompt: 'Hello ${name}!',
          variableValues: { name: 'John' },
          setGeneratedPrompt: setter
        }),
        { initialProps: { setter: mockSetGeneratedPrompt } }
      )

      // Initial call
      expect(mockSetGeneratedPrompt).toHaveBeenCalledTimes(1)
      expect(mockSetGeneratedPrompt).toHaveBeenCalledWith('Hello John!')

      // Clear the original mock and rerender with new setter function
      mockSetGeneratedPrompt.mockClear()
      rerender({ setter: newSetGeneratedPrompt })

      // The effect should run again since the component re-rendered, 
      // but the old setter should not be called again
      expect(mockSetGeneratedPrompt).not.toHaveBeenCalled()
      // The new setter should be called with the same result
      expect(newSetGeneratedPrompt).toHaveBeenCalledWith('Hello John!')
    })
  })

  describe('Complex scenarios', () => {
    it('should handle prompt with variables that have similar names', () => {
      const originalPrompt = 'Values: $\{value}, $\{value_1}, $\{value_11}, $\{value_2}'
      const variableValues = { 
        value: 'A', 
        value_1: 'B', 
        value_11: 'C', 
        value_2: 'D' 
      }
      
      renderHook(() => useGeneratePrompt({
        originalPrompt,
        variableValues,
        setGeneratedPrompt: mockSetGeneratedPrompt
      }))

      expect(mockSetGeneratedPrompt).toHaveBeenCalledWith('Values: A, B, C, D')
    })

    it('should handle prompt with variables containing regex special characters in values', () => {
      const originalPrompt = 'Pattern: $\{pattern}, Replace: $\{replace}'
      const variableValues = { 
        pattern: '\\d+\\.\\d{2}', 
        replace: '$1.00' 
      }
      
      renderHook(() => useGeneratePrompt({
        originalPrompt,
        variableValues,
        setGeneratedPrompt: mockSetGeneratedPrompt
      }))

      expect(mockSetGeneratedPrompt).toHaveBeenCalledWith('Pattern: \\d+\\.\\d{2}, Replace: $1.00')
    })

    it('should handle empty strings and whitespace-only values correctly', () => {
      const originalPrompt = 'Name: "$\{name}", Space: "$\{space}", Empty: "$\{empty}"'
      const variableValues = { 
        name: 'John', 
        space: '   ', 
        empty: '' 
      }
      
      renderHook(() => useGeneratePrompt({
        originalPrompt,
        variableValues,
        setGeneratedPrompt: mockSetGeneratedPrompt
      }))

      expect(mockSetGeneratedPrompt).toHaveBeenCalledWith('Name: "John", Space: "   ", Empty: "$\{empty}"')
    })
  })
})