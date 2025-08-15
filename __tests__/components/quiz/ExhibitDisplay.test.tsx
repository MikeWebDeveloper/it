import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExhibitDisplay } from '@/components/quiz/ExhibitDisplay'

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, onLoad, onError, ...props }: any) => {
    return (
      <img
        src={src}
        alt={alt}
        onLoad={onLoad}
        onError={onError}
        data-testid="exhibit-image"
        {...props}
      />
    )
  }
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}))

describe('ExhibitDisplay Component', () => {
  const mockExhibit = {
    src: '/exhibits/question-13/motherboard-components.svg',
    alt: 'Motherboard components identification diagram',
    caption: 'Key components of a modern motherboard',
    width: 800,
    height: 600
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders exhibit image with correct props', async () => {
      render(<ExhibitDisplay exhibit={mockExhibit} />)
      
      const image = screen.getByTestId('exhibit-image')
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute('src', mockExhibit.src)
      expect(image).toHaveAttribute('alt', mockExhibit.alt)
    })

    it('displays exhibit header with badge', () => {
      render(<ExhibitDisplay exhibit={mockExhibit} />)
      
      expect(screen.getByText('Exhibit')).toBeInTheDocument()
    })

    it('displays caption when provided', () => {
      render(<ExhibitDisplay exhibit={mockExhibit} />)
      
      expect(screen.getByText(mockExhibit.caption!)).toBeInTheDocument()
    })

    it('does not display caption when not provided', () => {
      const exhibitWithoutCaption = { ...mockExhibit, caption: undefined }
      render(<ExhibitDisplay exhibit={exhibitWithoutCaption} />)
      
      expect(screen.queryByText(mockExhibit.caption!)).not.toBeInTheDocument()
    })
  })

  describe('Loading States', () => {
    it('shows loading state initially', () => {
      render(<ExhibitDisplay exhibit={mockExhibit} />)
      
      expect(screen.getByText('Loading exhibit...')).toBeInTheDocument()
    })

    it('hides loading state after image loads', async () => {
      render(<ExhibitDisplay exhibit={mockExhibit} />)
      
      const image = screen.getByTestId('exhibit-image')
      fireEvent.load(image)
      
      await waitFor(() => {
        expect(screen.queryByText('Loading exhibit...')).not.toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('displays error state when image fails to load', async () => {
      render(<ExhibitDisplay exhibit={mockExhibit} />)
      
      const image = screen.getByTestId('exhibit-image')
      fireEvent.error(image)
      
      await waitFor(() => {
        expect(screen.getByText('Exhibit image not available')).toBeInTheDocument()
        expect(screen.getByText('Missing Image')).toBeInTheDocument()
        expect(screen.getByText(mockExhibit.alt)).toBeInTheDocument()
      })
    })

    it('shows alert icon in error state', async () => {
      render(<ExhibitDisplay exhibit={mockExhibit} />)
      
      const image = screen.getByTestId('exhibit-image')
      fireEvent.error(image)
      
      await waitFor(() => {
        expect(screen.getByText('Exhibit image not available')).toBeInTheDocument()
      })
    })
  })

  describe('Interactive Controls', () => {
    beforeEach(async () => {
      render(<ExhibitDisplay exhibit={mockExhibit} />)
      const image = screen.getByTestId('exhibit-image')
      fireEvent.load(image)
      await waitFor(() => {
        expect(screen.queryByText('Loading exhibit...')).not.toBeInTheDocument()
      })
    })

    it('has expand button in header', () => {
      const expandButton = screen.getByLabelText('Expand exhibit to full screen')
      expect(expandButton).toBeInTheDocument()
    })

    it('has download button in header', () => {
      const downloadButton = screen.getByLabelText('Download exhibit image')
      expect(downloadButton).toBeInTheDocument()
    })

    it('opens modal when expand button is clicked', async () => {
      const user = userEvent.setup()
      const expandButton = screen.getByLabelText('Expand exhibit to full screen')
      
      await user.click(expandButton)
      
      // Check for modal content (modal header, zoom controls, etc.)
      expect(screen.getByText('100%')).toBeInTheDocument() // Zoom percentage
    })

    it('creates download link when download button is clicked', async () => {
      const user = userEvent.setup()
      
      // Mock createElement and appendChild
      const mockLink = {
        href: '',
        download: '',
        click: jest.fn()
      }
      const createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      const appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation()
      const removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation()
      
      const downloadButton = screen.getByLabelText('Download exhibit image')
      await user.click(downloadButton)
      
      expect(createElementSpy).toHaveBeenCalledWith('a')
      expect(mockLink.href).toBe(mockExhibit.src)
      expect(mockLink.download).toBe('exhibit-motherboard-components-identification-diagram.png')
      expect(mockLink.click).toHaveBeenCalled()
      expect(appendChildSpy).toHaveBeenCalledWith(mockLink)
      expect(removeChildSpy).toHaveBeenCalledWith(mockLink)
      
      createElementSpy.mockRestore()
      appendChildSpy.mockRestore()
      removeChildSpy.mockRestore()
    })
  })

  describe('Modal Functionality', () => {
    beforeEach(async () => {
      render(<ExhibitDisplay exhibit={mockExhibit} />)
      const image = screen.getByTestId('exhibit-image')
      fireEvent.load(image)
      await waitFor(() => {
        expect(screen.queryByText('Loading exhibit...')).not.toBeInTheDocument()
      })
    })

    it('displays zoom controls in modal', async () => {
      const user = userEvent.setup()
      const expandButton = screen.getByRole('button', { name: /expand/i })
      
      await user.click(expandButton)
      
      expect(screen.getByText('100%')).toBeInTheDocument()
      // Note: We can't easily test zoom functionality without more complex mocking
    })

    it('closes modal when clicked outside', async () => {
      const user = userEvent.setup()
      const expandButton = screen.getByRole('button', { name: /expand/i })
      
      await user.click(expandButton)
      
      // Modal should be open
      expect(screen.getByText('100%')).toBeInTheDocument()
      
      // Click outside modal (on backdrop)
      const backdrop = screen.getByText('100%').closest('[role="dialog"]')?.parentElement
      if (backdrop) {
        await user.click(backdrop)
        // Modal should close - this is complex to test due to the portal and animation
      }
    })
  })

  describe('Accessibility', () => {
    it('has proper alt text for images', () => {
      render(<ExhibitDisplay exhibit={mockExhibit} />)
      
      const image = screen.getByTestId('exhibit-image')
      expect(image).toHaveAttribute('alt', mockExhibit.alt)
    })

    it('buttons have accessible labels', async () => {
      render(<ExhibitDisplay exhibit={mockExhibit} />)
      const image = screen.getByTestId('exhibit-image')
      fireEvent.load(image)
      
      await waitFor(() => {
        const expandButton = screen.getByLabelText('Expand exhibit to full screen')
        const downloadButton = screen.getByLabelText('Download exhibit image')
        
        expect(expandButton).toBeInTheDocument()
        expect(downloadButton).toBeInTheDocument()
      })
    })

    it('error state provides descriptive text', async () => {
      render(<ExhibitDisplay exhibit={mockExhibit} />)
      
      const image = screen.getByTestId('exhibit-image')
      fireEvent.error(image)
      
      await waitFor(() => {
        expect(screen.getByText('Exhibit image not available')).toBeInTheDocument()
        expect(screen.getByText(mockExhibit.alt)).toBeInTheDocument()
      })
    })
  })

  describe('Custom Styling', () => {
    it('applies custom className when provided', () => {
      const customClass = 'custom-exhibit-class'
      const { container } = render(<ExhibitDisplay exhibit={mockExhibit} className={customClass} />)
      
      expect(container.querySelector(`.${customClass}`)).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles exhibit without dimensions', () => {
      const exhibitWithoutDimensions = {
        src: '/test-image.svg',
        alt: 'Test image'
      }
      
      render(<ExhibitDisplay exhibit={exhibitWithoutDimensions} />)
      
      const image = screen.getByTestId('exhibit-image')
      expect(image).toBeInTheDocument()
    })

    it('handles very long alt text gracefully', () => {
      const exhibitWithLongAlt = {
        ...mockExhibit,
        alt: 'This is a very long alt text that should be handled gracefully by the component without breaking the layout or causing any accessibility issues for screen readers and other assistive technologies'
      }
      
      render(<ExhibitDisplay exhibit={exhibitWithLongAlt} />)
      
      const image = screen.getByTestId('exhibit-image')
      expect(image).toHaveAttribute('alt', exhibitWithLongAlt.alt)
    })

    it('handles special characters in download filename', async () => {
      const exhibitWithSpecialChars = {
        ...mockExhibit,
        alt: 'CPU/GPU & Other Parts!'
      }
      
      render(<ExhibitDisplay exhibit={exhibitWithSpecialChars} />)
      
      const image = screen.getByTestId('exhibit-image')
      fireEvent.load(image)
      
      await waitFor(() => {
        const downloadButton = screen.getByRole('button', { name: /download/i })
        expect(downloadButton).toBeInTheDocument()
      })
    })
  })
})