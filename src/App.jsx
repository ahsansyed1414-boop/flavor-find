import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { Search, Heart, Home, Utensils, ArrowLeft } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
// importScripts

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm px-4">
      <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
        <Utensils className="text-success" />
        <span className="fw-bold">FlavorFind</span>
      </Link>
      <div className="ms-auto d-flex gap-3">
        <Link className="btn btn-outline-light btn-sm d-flex align-items-center gap-1" to="/">
          <Home size={16} /> Home
        </Link>
        <Link className="btn btn-outline-light btn-sm d-flex align-items-center gap-1" to="/explore">
          <Search size={16} /> Explore
        </Link>
        <Link className="btn btn-outline-light btn-sm d-flex align-items-center gap-1" to="/favorites">
          <Heart size={16} className="text-danger" /> Favorites
        </Link>
      </div>
    </nav>
  );
}

//screen1
function HomeScreen() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  // const [featured, setFeatured] = useState({});
  // const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch('https://www.themealdb.com/api/json/v1/1/filter.php?c=Seafood');
        const data = await res.json();
        setFeatured(data.meals ? data.meals.slice(0, 6) : []);
      } catch (err) {
        console.error("Error fetching featured meals:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    // {}
    <div className="container py-5">
      <div className="p-5 mb-4 bg-light rounded-3 shadow-sm text-center">
        <h1 className="display-5 fw-bold text-dark">Welcome to FlavorFind</h1>
        <p className="col-md-8 fs-4 mx-auto text-muted">
          Discover delicious recipes from around the world instantly with our interactive meal planner powered by TheMealDB API.
        </p>
        <button className="btn btn-success btn-lg mt-2" onClick={() => navigate('/explore')}>
          Start Exploring Recipes
        </button>
      </div>

      <h2 className="mb-4 text-secondary">Featured Seafood Dishes</h2>
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status"></div>
        </div>
      ) : (
        <div className="row g-4">
          {featured.map(meal => (
            <div key={meal.idMeal} className="col-md-4">
              <div className="card h-100 shadow-sm border-0">
                <img src={meal.strMealThumb} className="card-img-top" alt={meal.strMeal} style={{ height: '200px', objectFit: 'cover' }} />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{meal.strMeal}</h5>
                  <button className="btn btn-outline-success mt-auto btn-sm" onClick={() => navigate(`/recipe/${meal.idMeal}`)}>
                    View Recipe
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

//explore and searrch screen
function ExploreScreen() {
  const [query, setQuery] = useState('');
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
      const data = await res.json();
      setMeals(data.meals || []);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4 text-center fw-bold">Explore & Search Recipes</h2>
      <form onSubmit={handleSearch} className="input-group mb-5 shadow-sm" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <input 
          type="text" 
          className="form-control form-control-lg" 
          placeholder="Search meals (e.g., Chicken, Pasta, Cake)..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn btn-success px-4" type="submit">
          <Search size={20} /> Search
        </button>
      </form>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status"></div>
        </div>
      )}

      {!loading && searched && meals.length === 0 && (
        <div className="alert alert-warning text-center">No recipes found matching "{query}". Try another search term!</div>
      )}

      <div className="row g-4">
        {meals.map(meal => (
          <div key={meal.idMeal} className="col-md-4">
            <div className="card h-100 shadow-sm border-0">
              <img src={meal.strMealThumb} className="card-img-top" alt={meal.strMeal} style={{ height: '200px', objectFit: 'cover' }} />
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{meal.strMeal}</h5>
                <p className="text-muted small">Category: {meal.strCategory} | Area: {meal.strArea}</p>
                <button className="btn btn-success mt-auto btn-sm" onClick={() => navigate(`/recipe/${meal.idMeal}`)}>
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

//recipe
function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
        const data = await res.json();
        if (data.meals) {
          setRecipe(data.meals[0]);
          const favs = JSON.parse(localStorage.getItem('flavor_favorites') || '[]');
          setIsFavorite(favs.some(f => f.idMeal === data.meals[0].idMeal));
        }
      } catch (err) {
        console.error("Error loading recipe:", err);
      } finally {
        setLoading(false);
      }
      // Todo: add new feature.
      // ?
    };
    fetchRecipe();
  }, [id]);

  const toggleFavorite = () => {
    let favs = JSON.parse(localStorage.getItem('flavor_favorites') || '[]');
    if (isFavorite) {
      favs = favs.filter(f => f.idMeal !== recipe.idMeal);
      setIsFavorite(false);
    } else {
      favs.push({ idMeal: recipe.idMeal, strMeal: recipe.strMeal, strMealThumb: recipe.strMealThumb });
      setIsFavorite(true);
    }
    localStorage.setItem('flavor_favorites', JSON.stringify(favs));
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-success"></div></div>;
  if (!recipe) return <div className="container py-5 text-center">Recipe not found.</div>;

  return (
    <div className="container py-5">
      <button className="btn btn-outline-secondary mb-4 d-flex align-items-center gap-2" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back
      </button>
      <div className="row bg-white p-4 rounded shadow-sm">
        <div className="col-md-5">
          <img src={recipe.strMealThumb} alt={recipe.strMeal} className="img-fluid rounded shadow" />
          <button 
            className={`btn w-100 mt-3 d-flex align-items-center justify-content-center gap-2 ${isFavorite ? 'btn-danger' : 'btn-outline-danger'}`}
            onClick={toggleFavorite}
          >
            <Heart size={18} fill={isFavorite ? "white" : "none"} /> {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
          </button>
        </div>
        <div className="col-md-7">
          <h2 className="fw-bold">{recipe.strMeal}</h2>
          <p className="text-muted"><strong>Category:</strong> {recipe.strCategory} | <strong>Cuisine:</strong> {recipe.strArea}</p>
          <h4 className="mt-4">Instructions</h4>
          <p style={{ whiteSpace: 'pre-line' }}>{recipe.strInstructions}</p>
        </div>
      </div>
    </div>
  );
}

//screen3
function FavoritesScreen() {
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem('flavor_favorites') || '[]');
    setFavorites(favs);
  }, []);

  const removeFav = (id) => {
    const updated = favorites.filter(f => f.idMeal !== id);
    setFavorites(updated);
    localStorage.setItem('flavor_favorites', JSON.stringify(updated));
  };

  return (
    // <div className="test">
    // <div className="addition">
    <div className="container py-5">
      <h2 className="mb-4 fw-bold">Your Favorite Recipes</h2>
      {favorites.length === 0 ? (
        <div className="alert alert-info text-center">You haven't saved any favorite recipes yet. Explore and heart your top picks!</div>
      ) : (
        <div className="row g-4">
          {favorites.map(meal => (
            <div key={meal.idMeal} className="col-md-4">
              <div className="card h-100 shadow-sm border-0">
                <img src={meal.strMealThumb} className="card-img-top" alt={meal.strMeal} style={{ height: '200px', objectFit: 'cover' }} />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{meal.strMeal}</h5>
                  <div className="d-flex gap-2 mt-auto">
                    <button className="btn btn-success btn-sm flex-grow-1" onClick={() => navigate(`/recipe/${meal.idMeal}`)}>View</button>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => removeFav(meal.idMeal)}>Remove</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

//router
export default function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <div className="min-vh-100 bg-light d-flex flex-column">
        <Navbar />
        <div className="flex-grow-1">
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/explore" element={<ExploreScreen />} />
            <Route path="/recipe/:id" element={<RecipeDetail />} />
            <Route path="/favorites" element={<FavoritesScreen />} />
          </Routes>
        </div>
        <footer className="bg-dark text-white text-center py-3 mt-auto">
          <small>&copy; 2026 FlavorFind. Built with React & TheMealDB API.</small>
        </footer>
      </div>
    </Router>
  );
}
