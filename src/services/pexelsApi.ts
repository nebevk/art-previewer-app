import axios, { type AxiosError } from 'axios'
import type { Img } from '@/types/media'

export interface PexelsSearchResponse {
  photos: Array<{
    id: number
    alt: string
    photographer: string
    avg_color: string
    src: {
      original: string
      large2x: string
      medium: string
    }
  }>
}

export interface SearchParams {
  query: string
  page: number
  perPage?: number
}

export class PexelsApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public isRetryable = false
  ) {
    super(message)
    this.name = 'PexelsApiError'
  }
}

/**
 * Validates and sanitizes search query input
 */
const sanitizeQuery = (query: string): string => {
  if (!query || typeof query !== 'string') {
    return 'art'
  }

  // Trim and limit length to prevent abuse
  const sanitized = query.trim().slice(0, 100)

  // Remove potentially dangerous characters (basic sanitization)
  // Pexels API should handle this, but we do it as defense in depth
  return sanitized.replace(/[<>\"']/g, '')
}

/**
 * Validates search parameters
 */
const validateSearchParams = (params: SearchParams): void => {
  if (params.page < 1 || params.page > 1000) {
    throw new PexelsApiError('Invalid page number', 400)
  }

  if (params.perPage && (params.perPage < 1 || params.perPage > 80)) {
    throw new PexelsApiError('Invalid per_page value', 400)
  }
}

/**
 * Checks if API key is configured
 */
const checkApiKey = (): string => {
  const apiKey = import.meta.env.VITE_PEXELS_API_KEY

  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
    throw new PexelsApiError(
      'API key is not configured. Please set VITE_PEXELS_API_KEY in your environment.',
      401
    )
  }

  return apiKey.trim()
}

/**
 * Creates a configured axios instance for Pexels API
 */
const createApiClient = () => {
  const apiKey = checkApiKey()

  return axios.create({
    baseURL: 'https://api.pexels.com/v1',
    timeout: 10000,
    headers: {
      Authorization: apiKey,
      'Content-Type': 'application/json',
    },
    // Ensure HTTPS only
    httpsAgent: undefined, // Let axios use default HTTPS
    validateStatus: (status) => status < 500, // Don't throw on 4xx errors
  })
}

/**
 * Handles API errors and converts them to user-friendly messages
 */
const handleApiError = (error: unknown): PexelsApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError

    // Network errors
    if (axiosError.code === 'ECONNABORTED') {
      return new PexelsApiError(
        'Request timeout. Please check your connection and try again.',
        408,
        true
      )
    }

    if (axiosError.code === 'ENOTFOUND' || axiosError.code === 'ECONNREFUSED') {
      return new PexelsApiError(
        'Network error. Please check your connection.',
        0,
        true
      )
    }

    // HTTP status errors
    const status = axiosError.response?.status

    switch (status) {
      case 401:
        return new PexelsApiError(
          'Authentication failed. Please check your API key configuration.',
          401
        )
      case 403:
        return new PexelsApiError(
          'Access forbidden. Please check your API key permissions.',
          403
        )
      case 429:
        return new PexelsApiError(
          'Rate limit exceeded. Please wait a moment before trying again.',
          429,
          true
        )
      case 400:
        return new PexelsApiError(
          'Invalid request. Please check your search parameters.',
          400
        )
      case 500:
      case 502:
      case 503:
      case 504:
        return new PexelsApiError(
          'Server error. Please try again later.',
          status,
          true
        )
      default:
        return new PexelsApiError(
          `Request failed with status ${status || 'unknown'}.`,
          status || 0,
          status ? status >= 500 : false
        )
    }
  }

  // Unknown error
  if (error instanceof Error) {
    return new PexelsApiError(error.message, 0, false)
  }

  return new PexelsApiError('An unexpected error occurred.', 0, false)
}

/**
 * Searches Pexels API for images
 * @param params - Search parameters
 * @returns Array of image objects
 * @throws {PexelsApiError} If the request fails
 */
export const searchPexels = async (params: SearchParams): Promise<Img[]> => {
  // Validate parameters
  validateSearchParams(params)

  // Sanitize query
  const sanitizedQuery = sanitizeQuery(params.query)

  // Create API client
  const client = createApiClient()

  try {
    const response = await client.get<PexelsSearchResponse>('/search', {
      params: {
        query: sanitizedQuery,
        per_page: params.perPage ?? 40,
        page: params.page,
      },
    })

    // Validate response structure
    if (!response.data || !Array.isArray(response.data.photos)) {
      throw new PexelsApiError('Invalid response format from API.', 500)
    }

    // Transform and validate response data
    const photos: Img[] = response.data.photos
      .map((p) => {
        // Basic validation of photo data
        if (!p.id || !p.src || !p.src.original) {
          console.warn('Invalid photo data received:', p)
          return null
        }

        return {
          id: p.id,
          alt: p.alt || 'Untitled',
          photographer: p.photographer || 'Unknown',
          avg_color: p.avg_color || '#000000',
          src: {
            original: p.src.original,
            large2x: p.src.large2x || p.src.original,
            medium: p.src.medium || p.src.original,
          },
        }
      })
      .filter((p): p is Img => p !== null)

    return photos
  } catch (error) {
    // Re-throw PexelsApiError as-is
    if (error instanceof PexelsApiError) {
      throw error
    }

    // Convert other errors
    throw handleApiError(error)
  }
}
