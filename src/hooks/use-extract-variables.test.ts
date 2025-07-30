import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useExtractVariables } from './use-extract-variables'

/**
 * Test suite for the useExtractVariables custom hook
 * 
 * This hook extracts variables from prompt strings in ${variableName} format
 * and manages their state through provided setter functions.
 */
describe('useExtractVariables', () => {
  // Mock state setter functions
  let mockSetVariables: ReturnType<typeof vi.fn>
  let mockSetVariableValues: ReturnType<typeof vi.fn>

  beforeEach(() => {
    // Reset mocks before each test
    mockSetVariables = vi.fn()
    mockSetVariableValues = vi.fn()
  })

  describe('Variable extraction', () => {
    it('should extract single variable from prompt', () => {
      const originalPrompt = 'Hello \\${name}!'
      
      renderHook(() => useExtractVariables({
        originalPrompt,
        setVariables: mockSetVariables,
        setVariableValues: mockSetVariableValues
      }))

      expect(mockSetVariables).toHaveBeenCalledWith(['name'])
    })

    it('should extract multiple variables from prompt', () => {
      const originalPrompt = 'Hello \\${name}, you are \\${age} years old and work as a \\${job}.'
      
      renderHook(() => useExtractVariables({
        originalPrompt,
        setVariables: mockSetVariables,
        setVariableValues: mockSetVariableValues
      }))

      expect(mockSetVariables).toHaveBeenCalledWith(['name', 'age', 'job'])
    })

    it('should handle duplicate variables by extracting unique ones only', () => {
      const originalPrompt = 'Hello \\${name}, nice to meet you \\${name}! Your name \\${name} is beautiful.'
      
      renderHook(() => useExtractVariables({
        originalPrompt,
        setVariables: mockSetVariables,
        setVariableValues: mockSetVariableValues
      }))

      expect(mockSetVariables).toHaveBeenCalledWith(['name'])
    })

    it('should handle mixed variable patterns', () => {
      const originalPrompt = 'User \\${user_id} has \\${item_count} items and \\${total_amount} dollars.'
      
      renderHook(() => useExtractVariables({
        originalPrompt,
        setVariables: mockSetVariables,
        setVariableValues: mockSetVariableValues
      }))

      expect(mockSetVariables).toHaveBeenCalledWith(['user_id', 'item_count', 'total_amount'])
    })

    it('should ignore malformed variable patterns', () => {
      const originalPrompt = 'Hello $name} and ${age and {invalid} and ${ } and ${123invalid}'
      
      renderHook(() => useExtractVariables({
        originalPrompt,
        setVariables: mockSetVariables,
        setVariableValues: mockSetVariableValues
      }))

      // Only valid variables should be extracted (age is valid, others are malformed)
      expect(mockSetVariables).toHaveBeenCalledWith(['123invalid'])
    })

    it('should handle empty prompt', () => {
      const originalPrompt = ''
      
      renderHook(() => useExtractVariables({
        originalPrompt,
        setVariables: mockSetVariables,
        setVariableValues: mockSetVariableValues
      }))

      expect(mockSetVariables).toHaveBeenCalledWith([])
    })

    it('should handle prompt with no variables', () => {
      const originalPrompt = 'This is a plain text prompt with no variables.'
      
      renderHook(() => useExtractVariables({
        originalPrompt,
        setVariables: mockSetVariables,
        setVariableValues: mockSetVariableValues
      }))

      expect(mockSetVariables).toHaveBeenCalledWith([])
    })
  })

  describe('Variable values management', () => {
    it('should initialize variable values for new variables', () => {
      const originalPrompt = 'Hello \\${name} and \\${age}!'
      
      renderHook(() => useExtractVariables({
        originalPrompt,
        setVariables: mockSetVariables,
        setVariableValues: mockSetVariableValues
      }))

      // Check that setVariableValues was called with a function
      expect(mockSetVariableValues).toHaveBeenCalledWith(expect.any(Function))
      
      // Test the function behavior by calling it with mock previous state
      const updateFunction = mockSetVariableValues.mock.calls[0][0]
      const previousValues = {}
      const result = updateFunction(previousValues)
      
      expect(result).toEqual({
        name: '',
        age: ''
      })
    })

    it('should preserve existing variable values and add new ones', () => {
      const originalPrompt = 'Hello \\${name} and \\${age}!'
      
      renderHook(() => useExtractVariables({
        originalPrompt,
        setVariables: mockSetVariables,
        setVariableValues: mockSetVariableValues
      }))

      // Test with existing values
      const updateFunction = mockSetVariableValues.mock.calls[0][0]
      const previousValues = { name: 'John', city: 'New York' }
      const result = updateFunction(previousValues)
      
      expect(result).toEqual({
        name: 'John', // preserved
        age: ''       // newly added
        // city removed since it's not in current variables
      })
    })

    it('should remove values for variables that no longer exist', () => {
      const originalPrompt = 'Hello \\${name}!'
      
      renderHook(() => useExtractVariables({
        originalPrompt,
        setVariables: mockSetVariables,
        setVariableValues: mockSetVariableValues
      }))

      // Test removal of obsolete variables
      const updateFunction = mockSetVariableValues.mock.calls[0][0]
      const previousValues = { 
        name: 'John', 
        age: '25', 
        city: 'New York',
        job: 'Developer'
      }
      const result = updateFunction(previousValues)
      
      expect(result).toEqual({
        name: 'John' // only name should remain
      })
    })

    it('should handle empty variable list by clearing all values', () => {
      const originalPrompt = 'No variables here!'
      
      renderHook(() => useExtractVariables({
        originalPrompt,
        setVariables: mockSetVariables,
        setVariableValues: mockSetVariableValues
      }))

      const updateFunction = mockSetVariableValues.mock.calls[0][0]
      const previousValues = { name: 'John', age: '25' }
      const result = updateFunction(previousValues)
      
      expect(result).toEqual({})
    })
  })

  describe('Hook re-execution behavior', () => {
    it('should re-execute when originalPrompt changes', () => {
      const { rerender } = renderHook(
        ({ prompt }) => useExtractVariables({
          originalPrompt: prompt,
          setVariables: mockSetVariables,
          setVariableValues: mockSetVariableValues
        }),
        { initialProps: { prompt: 'Hello \\${name}!' } }
      )

      // Initial call
      expect(mockSetVariables).toHaveBeenCalledTimes(1)
      expect(mockSetVariables).toHaveBeenCalledWith(['name'])

      // Clear mocks and rerender with new prompt
      mockSetVariables.mockClear()
      mockSetVariableValues.mockClear()
      
      rerender({ prompt: 'Hi \\${user} and \\${age}!' })

      // Should be called again with new variables
      expect(mockSetVariables).toHaveBeenCalledTimes(1)
      expect(mockSetVariables).toHaveBeenCalledWith(['user', 'age'])
    })

    it('should not re-execute when setter functions change (stable references)', () => {
      const newSetVariables = vi.fn()
      const newSetVariableValues = vi.fn()
      
      const { rerender } = renderHook(
        ({ setVars, setVarVals }) => useExtractVariables({
          originalPrompt: 'Hello \\${name}!',
          setVariables: setVars,
          setVariableValues: setVarVals
        }),
        { 
          initialProps: { 
            setVars: mockSetVariables, 
            setVarVals: mockSetVariableValues 
          } 
        }
      )

      // Initial call
      expect(mockSetVariables).toHaveBeenCalledTimes(1)

      // Rerender with new setter functions (but same prompt)
      rerender({ 
        setVars: newSetVariables, 
        setVarVals: newSetVariableValues 
      })

      // New setters should not be called since prompt didn't change
      expect(newSetVariables).not.toHaveBeenCalled()
      expect(newSetVariableValues).not.toHaveBeenCalled()
    })
  })

  describe('Edge cases and error handling', () => {
    it('should handle very long prompts with many variables', () => {
      const variables = Array.from({ length: 10 }, (_, i) => `var${i}`)
      const originalPrompt = '${var0} ${var1} ${var2} ${var3} ${var4} ${var5} ${var6} ${var7} ${var8} ${var9}'
      
      renderHook(() => useExtractVariables({
        originalPrompt,
        setVariables: mockSetVariables,
        setVariableValues: mockSetVariableValues
      }))

      expect(mockSetVariables).toHaveBeenCalledWith(variables)
    })

    it('should handle special characters in variable names', () => {
      const originalPrompt = 'Hello \\${user_name} and \\${item123} and \\${data_field_1}!'
      
      renderHook(() => useExtractVariables({
        originalPrompt,
        setVariables: mockSetVariables,
        setVariableValues: mockSetVariableValues
      }))

      expect(mockSetVariables).toHaveBeenCalledWith(['user_name', 'item123', 'data_field_1'])
    })

    it('should handle multiline prompts', () => {
      const originalPrompt = `Hello \${name},
        
        Your age is \${age} and you live in \${city}.
        Thank you for using our service!`
      
      renderHook(() => useExtractVariables({
        originalPrompt,
        setVariables: mockSetVariables,
        setVariableValues: mockSetVariableValues
      }))

      expect(mockSetVariables).toHaveBeenCalledWith(['name', 'age', 'city'])
    })
  })
})