class NewsManager {
  constructor(data) {
    this.newsData = data;
    this.filteredData = [...data];
    this.currentSort = "date";
    this.currentCategory = "All";
    this.container = document.getElementById("newsContent");
    this.categoryList = document.getElementById("categoryList");
    this.currentCategoryTitle = document.getElementById("currentCategory");

    this.initializeCategories();
    this.initializeSorting();
    this.initializeSidebar();
    this.initializeBreakingNews();
  }
  
  initializeSidebar() {
    const sidebar = document.getElementById("sidebar");
  }

  
  initializeCategories() {
    const categories = ["All", ...new Set(this.newsData.map(article => article.category))];
    this.categoryList.innerHTML = categories
      .map(category => `<div class="category-item ${category === "All" ? "active" : ""}" data-category="${category}">${category}</div>`)
      .join("");

    this.categoryList.addEventListener("click", e => {
      const category = e.target.dataset.category;
      if (category) this.filterByCategory(category);
    });
  }

  initializeSorting() {
    document.querySelectorAll(".dropdown-item").forEach(item => {
      item.addEventListener("click", e => {
        e.preventDefault();
        this.sortNews(e.target.dataset.sort);
        document.getElementById("sortDropdown").textContent = `Sort By: ${e.target.textContent}`;
      });
    });
  }

 

  initializeBreakingNews() {
    document.getElementById("breakingNewsBtn").addEventListener("click", () => this.showMostPopularArticle());
  }

  showMostPopularArticle() {
    const mostPopularArticle = this.getMostPopularArticle();
    const breakingNewsContent = document.getElementById("breakingNewsContent");

    breakingNewsContent.innerHTML = `
      <div class="card">
        <img src="${mostPopularArticle.img}" class="card-img-top" alt="${mostPopularArticle.title}" style="max-height: 200px; object-fit: cover">
        <div class="card-body">
          <h5 class="card-title">${mostPopularArticle.title}</h5>
          <h6 class="card-subtitle mb-2 text-muted">${this.formatDate(mostPopularArticle.date)}</h6>
          <p class="card-text">${mostPopularArticle.content}</p>
        </div>
      </div>
    `;
    new bootstrap.Modal(document.getElementById("breakingNewsModal")).show();
  }

  getMostPopularArticle() {
    return this.newsData.reduce((prev, current) => (prev.views > current.views ? prev : current));
  }

  calculateReadingTime(wordCount) {
    return (wordCount / 200).toFixed(1);
  }

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }

  createNewsCard(article) {
    const readingTime = this.calculateReadingTime(article.wordCount);
    return `
      <div class="col">
        <div class="card h-100 position-relative article-card" data-article-id="${article.id}">
          <img src="${article.img}" class="card-img-top" alt="${article.title}" style="max-height: 200px; object-fit: cover">
          <span class="category-badge">${article.category}</span>
          <div class="card-body">
            <h5 class="card-title">${article.title}</h5>
            <h6 class="card-subtitle mb-2 text-muted">${this.formatDate(article.date)}</h6>
            <p class="card-text">${article.content.substring(0, 150)}...</p>
            <div class="mt-3">
              <small class="text-muted"><i class="fas fa-eye me-1"></i> ${article.views}</small>
              <small class="text-muted ms-3"><i class="fas fa-book-reader me-1"></i> ${readingTime} min read</small>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  showArticleModal(articleId) {
    const article = this.newsData.find(a => a.id === articleId);
    if (!article) return;

    article.views++;
    document.querySelector(`.article-card[data-article-id="${articleId}"] .fa-eye`).nextSibling.textContent = ` ${article.views} views`;

    const readingTime = this.calculateReadingTime(article.wordCount);
    document.getElementById("articleModalLabel").textContent = article.title;
    document.getElementById("articleModalContent").innerHTML = `
      <img src="${article.img}" class="img-fluid modal-img mb-3" alt="${article.title}" style="max-height: 200px; width: 50%; object-fit: cover; display: block; margin: 0 auto;">
      <div class="article-metadata mb-3">
        <span class="badge bg-secondary">${article.category}</span>
        <small class="text-muted ms-2">${this.formatDate(article.date)}</small>
      </div>
      <p>${article.content}</p>
    `;
    document.getElementById("articleModalViews").innerHTML = `<i class="fas fa-eye me-1"></i> ${article.views} views`;
    document.getElementById("articleModalReadTime").innerHTML = `<i class="fas fa-book-reader me-1"></i> ${readingTime} min read`;

    new bootstrap.Modal(document.getElementById("articleModal")).show();
  }

  sortNews(sortBy) {
    this.currentSort = sortBy;
    this.filteredData.sort((a, b) => {
      switch (sortBy) {
        case "date": return new Date(b.date) - new Date(a.date);
        case "views": return b.views - a.views;
        case "wordCount": return b.wordCount - a.wordCount;
        default: return 0;
      }
    });
    this.displayNews();
  }

  filterByCategory(category) {
    document.querySelectorAll(".category-item").forEach(item => item.classList.toggle("active", item.textContent === category));
    this.currentCategory = category;
    this.currentCategoryTitle.textContent = category === "All" ? "All News" : `${category} News`;
    this.filteredData = category === "All" ? [...this.newsData] : this.newsData.filter(a => a.category === category);
    this.sortNews(this.currentSort);
  }

  displayNews() {
    this.container.innerHTML = this.filteredData.map(article => this.createNewsCard(article)).join("");
    document.querySelectorAll(".article-card").forEach(card => {
      card.addEventListener("click", () => this.showArticleModal(parseInt(card.dataset.articleId)));
    });
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("Articles.json");
    const articlesData = await response.json();
    new NewsManager(articlesData.articles).displayNews();
  } catch (error) {
    console.error("Error loading articles:", error);
  }
});

class ThemeManager {
  constructor() {
    this.body = document.body;
    this.toggleBtn = document.getElementById("toggleMode");
    this.currentTheme = localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    this.icons = { light: "fa-sun", dark: "fa-moon" };
    this.applyTheme(this.currentTheme);
  }

  applyTheme(theme) {
    this.body.classList.toggle("bg-light", theme === "light");
    this.body.classList.toggle("bg-dark", theme === "dark");
    this.toggleBtn.innerHTML = `<i class="fa ${this.icons[theme]}"></i>`;
    localStorage.setItem("theme", theme);
  }

  init() {
    this.toggleBtn.addEventListener("click", () => {
      this.currentTheme = this.currentTheme === "light" ? "dark" : "light";
      this.applyTheme(this.currentTheme);
    });
  }
}

document.addEventListener("DOMContentLoaded", () => new ThemeManager().init());
