import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import PostStats from './PostStats'

describe('PostStats Component', () => {
  it('renders zero values', () => {
    render(<PostStats stats={{ total: 0, published: 0, draft: 0 }} />)
    expect(screen.getByTestId('stat-total')).toHaveTextContent('0')
    expect(screen.getByTestId('stat-published')).toHaveTextContent('0')
    expect(screen.getByTestId('stat-draft')).toHaveTextContent('0')
  })

  it('renders the three summary cards with the given values', () => {
    render(<PostStats stats={{ total: 10, published: 6, draft: 4 }} />)
    expect(screen.getByText('Total Artikel')).toBeInTheDocument()
    expect(screen.getByText('Total Terbit')).toBeInTheDocument()
    expect(screen.getByText('Belum Selesai (Draf)')).toBeInTheDocument()
    expect(screen.getByTestId('stat-total')).toHaveTextContent('10')
    expect(screen.getByTestId('stat-published')).toHaveTextContent('6')
    expect(screen.getByTestId('stat-draft')).toHaveTextContent('4')
  })
})
