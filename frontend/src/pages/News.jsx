import React, { useState, useEffect } from 'react';
import { Calendar, Tag, Search, ChevronRight } from 'lucide-react';
import { newsAPI } from '../config/api';
import './News.css';

const News = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newsArticles, setNewsArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = ['all', 'Health', 'Events', 'Safety', 'Education', 'Environment', 'Announcements'];
  
  // Helper function to get full image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http')) return imageUrl;
    // If it's a relative path, prepend the backend server URL
    return `http://127.0.0.1:5000${imageUrl}`;
  };

  // Fetch news from backend
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const data = await newsAPI.getAll(selectedCategory);
        setNewsArticles(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Failed to load news articles');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [selectedCategory]);

  const filteredNews = newsArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const featuredArticle = filteredNews.find(article => article.featured);
  const regularArticles = filteredNews.filter(article => !article.featured);

  return (
    <div className="news-page">
      {/* Hero Section */}
      <section className="news-hero">
        <div className="container">
          <h1 className="news-hero-title">News & Announcements</h1>
          <p className="news-hero-subtitle">Stay updated with the latest news and events from Barangay NIT</p>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="news-filters-section">
        <div className="container">
          <div className="news-filters">
            {/* Search Bar */}
            <div className="news-search">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search news..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="news-search-input"
              />
            </div>

            {/* Category Filter */}
            <div className="news-categories">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                >
                  {category === 'all' ? 'All News' : category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <section className="news-grid-section">
          <div className="container">
            <p style={{ textAlign: 'center', padding: '4rem 0', color: '#6b7280' }}>
              Loading news articles...
            </p>
          </div>
        </section>
      )}

      {/* Error State */}
      {error && (
        <section className="news-grid-section">
          <div className="container">
            <p style={{ textAlign: 'center', padding: '4rem 0', color: '#ef4444' }}>
              {error}
            </p>
          </div>
        </section>
      )}

      {/* Featured Article */}
      {!loading && !error && featuredArticle && selectedCategory === 'all' && !searchTerm && (
        <section className="featured-section">
          <div className="container">
            <div className="featured-article">
              <div className="featured-image">
                <img src={getImageUrl(featuredArticle.image_url)} alt={featuredArticle.title} />
                <span className="featured-badge">Featured</span>
              </div>
              <div className="featured-content">
                <div className="article-meta">
                  <span className="article-category">
                    <Tag size={16} />
                    {featuredArticle.category}
                  </span>
                  <span className="article-date">
                    <Calendar size={16} />
                    {new Date(featuredArticle.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                <h2 className="featured-title">{featuredArticle.title}</h2>
                <p className="featured-excerpt">{featuredArticle.excerpt}</p>
                <button className="read-more-btn">
                  Read More <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* News Grid */}
      {!loading && !error && (
        <section className="news-grid-section">
          <div className="container">
            {filteredNews.length > 0 ? (
              <div className="news-grid">
                {regularArticles.map(article => (
                  <article key={article.id} className="news-card">
                    <div className="news-card-image">
                      <img src={getImageUrl(article.image_url)} alt={article.title} />
                    </div>
                    <div className="news-card-content">
                      <div className="article-meta">
                        <span className="article-category">
                          <Tag size={14} />
                          {article.category}
                        </span>
                        <span className="article-date">
                          <Calendar size={14} />
                          {new Date(article.created_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <h3 className="news-card-title">{article.title}</h3>
                      <p className="news-card-excerpt">{article.excerpt}</p>
                      <button className="read-more-link">
                        Read More <ChevronRight size={16} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <p>No news articles found matching your search.</p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default News;