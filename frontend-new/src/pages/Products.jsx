import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Filter, X, ChevronDown } from 'lucide-react'
import { useProductStore } from '../store/productStore'
import ProductCard from '../components/product/ProductCard'

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)

  const { products, pagination, categories, loading, getProducts, getCategories } = useProductStore()

  // Get filters from URL
  const gender = searchParams.get('gender') || 'all'
  const sort = searchParams.get('sort') || 'newest'
  const category = searchParams.get('category') || null
  const search = searchParams.get('search') || null
  const page = parseInt(searchParams.get('page') || '1')

  useEffect(() => {
    getProducts({ page, gender, sort, category })
    getCategories(gender)
  }, [page, gender, sort, category])

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams)
    if (value && value !== 'all') {
      newParams.set(key, value)
    } else {
      newParams.delete(key)
    }
    newParams.set('page', '1')
    setSearchParams(newParams)
  }

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'popular', label: 'Popular' }
  ]

  const genderOptions = [
    { value: 'all', label: 'All' },
    { value: 'male', label: 'Men' },
    { value: 'female', label: 'Women' },
    { value: 'unisex', label: 'Unisex' }
  ]

  return (
    <div className="shop-page page-padding">
      <div className="container">
        {/* Header */}
        <div className="shop-header">
          <div>
            <h1 className="heading-3 mb-2">
              {search ? `Search: "${search}"` : 'All Products'}
            </h1>
            <p className="text-muted">
              {pagination.total} products found
            </p>
          </div>

          <button
            className="btn btn-secondary flex-center gap-2"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <Filter size={18} />
            Filters
          </button>
        </div>

        {/* Filters */}
        {filtersOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="filters-panel glass-card"
          >
            {/* Gender Filter */}
            <div className="filter-group">
              <label className="filter-label">Category</label>
              <select
                value={gender}
                onChange={(e) => updateFilter('gender', e.target.value)}
                className="glossy-input"
              >
                {genderOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div className="filter-group">
              <label className="filter-label">Sort By</label>
              <select
                value={sort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="glossy-input"
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            <button
              className="btn btn-ghost"
              onClick={() => setSearchParams({})}
            >
              <X size={16} /> Clear All
            </button>
          </motion.div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="product-grid">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="product-card skeleton-card">
                <div className="skeleton aspect-3-4"></div>
                <div className="p-4">
                  <div className="skeleton h-5 mb-2"></div>
                  <div className="skeleton h-6 w-60"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="product-grid">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p className="text-lg mb-4">No products found</p>
            <button
              className="btn btn-secondary"
              onClick={() => setSearchParams({})}
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {pagination.total > pagination.limit && (
          <div className="pagination">
            {[...Array(Math.ceil(pagination.total / pagination.limit))].map((_, i) => (
              <button
                key={i}
                className={`btn pagination-btn ${pagination.page === i + 1 ? 'btn-accent' : 'btn-secondary'}`}
                onClick={() => updateFilter('page', String(i + 1))}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Products
