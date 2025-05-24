// AdminShopManagementPage.js
import React, { useState, useEffect } from 'react';
import { VscSearch } from 'react-icons/vsc';
import { toast } from 'sonner';
import UnderHeader from '../../components/UnderHeader';
import '../profile/ProfilePage.css';
import './AdminPanelPage.css';
import './AdminShopManagementPage.css';

const AdminShopManagementPage = () => {
  const [user, setUser] = useState(null);
  const [entityType, setEntityType] = useState('shop'); // 'shop' | 'category' | 'product'
  const [viewMode, setViewMode] = useState('view');

  // Shop states
  const [shops, setShops] = useState([]);
  const [newShop, setNewShop] = useState({
    name: '',
    nameLink: '',
    description: '',
    picture: '',
    status: 'active'
  });

  const [categoriesForSelectedShop, setCategoriesForSelectedShop] = useState([]);
  // Category state
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({
    shopId: '',
    name: '',
    nameLink: '',
    description: '',
    picture: '',
    status: 'active'
  });

  // Product state
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    categoryId: '',
    name: '',
    description: '',
    price_rub: '',
    price_uah: '',
    price_eur: '',
    price_bufferkacoin: '',
    stock: '',
    picture: '',
    picture_compressed: ''
  });

  // consts for editing shops, categories, products
  const [editingShopId, setEditingShopId] = useState(null);
  const [editShopData, setEditShopData] = useState({
    id: '',
    name: '',
    nameLink: '',
    description: '',
    picture: '',
    status: 'active'
  });

  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editCategoryData, setEditCategoryData] = useState({
    id: '',
    shopId: '',
    name: '',
    nameLink: '',
    description: '',
    picture: '',
    status: 'active'
  });

  const [editingProductId, setEditingProductId] = useState(null);
  const [editProductData, setEditProductData] = useState({
    id: '',
    shopId: '',
    categoryId: '',
    name: '',
    description: '',
    price_rub: '',
    price_uah: '',
    price_eur: '',
    price_bufferkacoin: '',
    stock: '',
    picture: '',
    picture_compressed: '',
    status: 'active'
  });


  // getting data from the server
  const fetchShops = async () => {
    try {
      const response = await fetch('/admin/shop/readAll', { credentials: 'include' });
      const data = await response.json();
      setShops(data);
    } catch (error) {
      toast.error('Error fetching shops');
    }
  };

const fetchAllCategories = async () => {
    try {
      const response = await fetch('/admin/categories/readAll', { credentials: 'include' });
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      toast.error('Error fetching categories');
    }
  };

const fetchProducts = async () => {
    try {
      const response = await fetch('/admin/products/readAll', { credentials: 'include' });
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      toast.error('Error fetching products');
    }
  };

const fetchCategoriesByShop = async (shopId) => {
    try {
      const response = await fetch(`/admin/categories/categoriesInShop/${shopId}`, { credentials: 'include' });
      const data = await response.json();
      setCategoriesForSelectedShop(data);
    } catch (error) {
      toast.error('Error fetching categories for shop');
    }
  };

  const handleEntityClick = (type) => {
    setEntityType(type);
    setViewMode('view');
  };

  const handleAddClick = (type) => {
    setEntityType(type);
    setViewMode('add');
  };

  useEffect(() => {
    fetch('/api/user', { credentials: 'include' })
      .then(res => res.json())
      .then(userData => {
        if (userData && userData.id && userData.role === 'admin') {
          setUser(userData);
          if (viewMode === 'view') {
            if (entityType === 'shop') {
              fetchShops();
            } else if (entityType === 'category') {
              fetchAllCategories();
              fetchShops();
            } else if (entityType === 'product') {
              fetchProducts();
              fetchShops();
            }
          } else {
            if (entityType === 'category') {
              fetchShops();
            } else if (entityType === 'product') {
              fetchShops();
            }
          }
        } else {
          setUser(null);
          throw new Error('User not authenticated');
        }
      })
      .catch(error => {
        toast.error('Error fetching user data');
        setUser(null);
      });
    
  }, [entityType, viewMode]);

  // Добавление нового магазина
  const handleAddShop = async () => {
    if (!newShop.name || !newShop.description || !newShop.nameLink || !newShop.status) {
      toast.error('Please fill in all required fields for the shop');
      return;
    }
    try {
      const response = await fetch('/admin/shop/add_shop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newShop)
      });
      if (response.ok) {
        const addedShop = await response.json();
        setShops(prev => [...prev, addedShop]);
        toast.success('Shop added successfully');
        setNewShop({ name: '', nameLink: '', description: '', picture: '', status: 'active' });
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Error adding shop');
      }
    } catch (error) {
      toast.error('Error adding shop');
    }
  };

const handleDeleteShop = async (shopId) => {
    try {
      const response = await fetch(`/admin/shop/delete/${shopId}`, {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        setShops(prev => prev.filter(shop => shop.id !== shopId));
        toast.success('Shop deleted');
      } else {
        toast.error('Error deleting shop');
      }
    } catch (error) {
      toast.error('Error deleting shop');
    }
  };

// Adding a new category
const handleAddCategory = async () => {
    const { shopId, name, nameLink, description } = newCategory;
    if (!shopId || !name || !nameLink || !description) {
      toast.error('Please fill in all required fields for the category');
      return;
    }
    try {
      const response = await fetch('/admin/categories/add_category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newCategory),
      });
      if (response.ok) {
        const addedCategory = await response.json();
        setCategories(prev => [...prev, addedCategory]);
        toast.success('Category added successfully');
        // Reset the form
        setNewCategory({
          shopId: '',
          name: '',
          nameLink: '',
          description: '',
          picture: '',
          status: 'active',
        });
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Error adding category');
      }
    } catch (error) {
      toast.error('Error adding category');
    }
  };

const handleDeleteCategory = async (categoryId) => {
    try {
      const response = await fetch(`/admin/categories/delete/${categoryId}`, {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        setCategories(prev => prev.filter(cat => cat.id !== categoryId));
        toast.success('Category deleted');
      } else {
        toast.error('Error deleting category');
      }
    } catch (error) {
      toast.error('Error deleting category');
    }
  };

// Adding a new product
const handleAddProduct = async () => {
    const {
      shopId,
      categoryId,
      name,
      description,
      price_rub,
    } = newProduct;

    // Minimal validation
    if (!shopId || !categoryId || !name || !description || !price_rub) {
      toast.error('Please fill in all required fields for the product');
      return;
    }

    try {
      const response = await fetch('/admin/products/add_product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newProduct),
      });
      if (response.ok) {
        const addedProduct = await response.json();
        setProducts(prev => [...prev, addedProduct]);
        toast.success('Product added successfully');
        // Reset the form
        setNewProduct({
          shopId: '',
          categoryId: '',
          name: '',
          description: '',
          price_rub: '',
          price_uah: '',
          price_eur: '',
          price_bufferkacoin: '',
          stock: '',
          picture: '',
          picture_compressed: '',
        });
        setCategoriesForSelectedShop([]);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Error adding product');
      }
    } catch (error) {
      toast.error('Error adding product');
    }
  };

const handleDeleteProduct = async (productId) => {
    try {
      const response = await fetch(`/admin/products/delete/${productId}`, {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        setProducts(prev => prev.filter(prod => prod.id !== productId));
        toast.success('Product deleted');
      } else {
        toast.error('Error deleting product');
      }
    } catch (error) {
      toast.error('Error deleting product');
    }
  };


  const handleCategoryShopChange = (shopId) => {
    setNewCategory(prev => ({ ...prev, shopId }));
  };

  const handleProductShopChange = (shopId) => {
    setNewProduct(prev => ({
      ...prev,
      shopId,
      categoryId: '',
    }));
    fetchCategoriesByShop(shopId);
  };

  const handleProductCategoryChange = (categoryId) => {
    setNewProduct(prev => ({
      ...prev,
      categoryId,
    }));
  };

  //functions for editing shops, categories, products

  const startEditShop = (shop) => {
    setEditingShopId(shop.id);
    setEditShopData({
      id: shop.id,
      name: shop.name,
      nameLink: shop.nameLink,
      description: shop.description,
      picture: shop.picture,
      status: shop.status
    });
  };

  const cancelEditShop = () => {
    setEditingShopId(null);
  };

  const handleUpdateShop = async (shopId) => {
    try {
      const response = await fetch('/admin/shop/update_shop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editShopData)
      });
      if (response.ok) {
        toast.success('Shop updated');
        setEditingShopId(null);
        fetchShops();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Error updating shop');
      }
    } catch (error) {
      toast.error('Error updating shop');
    }
  };

const handleToggleShopStatus = async (shop) => {
    const newStatus = shop.status === 'active' ? 'disabled' : 'active';
    try {
      const response = await fetch('/admin/shop/update_shop_status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: shop.id, status: newStatus })
      });
      if (response.ok) {
        toast.success('Shop status updated');
        fetchShops();
      } else {
        toast.error('Error updating shop status');
      }
    } catch (error) {
      toast.error('Error updating shop status');
    }
  };

const startEditCategory = (cat) => {
    setEditingCategoryId(cat.id);
    setEditCategoryData({
      id: cat.id,
      shopId: cat.shopId,
      name: cat.name,
      nameLink: cat.nameLink || '',
      description: cat.description,
      picture: cat.picture || '',
      status: cat.status
    });
  };

const cancelEditCategory = () => {
    setEditingCategoryId(null);
  };

const handleUpdateCategory = async (categoryId) => {
    try {
      const response = await fetch('/admin/categories/update_category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editCategoryData)
      });
      if (response.ok) {
        toast.success('Category updated');
        setEditingCategoryId(null);
        fetchAllCategories();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Error updating category');
      }
    } catch (error) {
      toast.error('Error updating category');
    }
  };

const handleToggleCategoryStatus = async (cat) => {
    const newStatus = cat.status === 'active' ? 'disabled' : 'active';
    try {
      const response = await fetch('/admin/categories/update_category_status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: cat.id, status: newStatus })
      });
      if (response.ok) {
        toast.success('Category status updated');
        fetchAllCategories();
      } else {
        toast.error('Error updating category status');
      }
    } catch (error) {
      toast.error('Error updating category status');
    }
  };

// For products:
const startEditProduct = (prod) => {
    setEditingProductId(prod.id);
    setEditProductData({
      id: prod.id,
      shopId: prod.shopId || '',
      categoryId: prod.categoryId,
      name: prod.name,
      description: prod.description,
      price_rub: prod.price_rub,
      price_uah: prod.price_uah,
      price_eur: prod.price_eur,
      price_bufferkacoin: prod.price_bufferkacoin,
      stock: prod.stock,
      picture: prod.picture,
      picture_compressed: prod.picture_compressed,
      status: prod.status || 'active'
    });
    if (prod.shopId) fetchCategoriesByShop(prod.shopId);
  };

const cancelEditProduct = () => {
    setEditingProductId(null);
  };

const handleUpdateProduct = async (productId) => {
    try {
      const response = await fetch('/admin/products/update_product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editProductData)
      });
      if (response.ok) {
        toast.success('Product updated');
        setEditingProductId(null);
        fetchProducts();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Error updating product');
      }
    } catch (error) {
      toast.error('Error updating product');
    }
  };

const handleToggleProductStatus = async (prod) => {
    const newStatus = prod.status === 'active' ? 'disabled' : 'active';
    try {
      const response = await fetch('/admin/products/update_product_status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: prod.id, status: newStatus })
      });
      if (response.ok) {
        toast.success('Product status updated');
        fetchProducts();
      } else {
        toast.error('Error updating product status');
      }
    } catch (error) {
      toast.error('Error updating product status');
    }
  };

  return (
    <div className="admin-management-page">
      {user ? (
        <>
          <UnderHeader title="Manage Shops, Categories, and Products" />
          <div className="admin-management-navigation">
            <button
              className={entityType === 'shop' && viewMode === 'view' ? 'active' : ''}
              onClick={() => handleEntityClick('shop')}
            >
              Shop
            </button>
            <button
              className={entityType === 'category' && viewMode === 'view' ? 'active' : ''}
              onClick={() => handleEntityClick('category')}
            >
              Category
            </button>
            <button
              className={entityType === 'product' && viewMode === 'view' ? 'active' : ''}
              onClick={() => handleEntityClick('product')}
            >
              Product
            </button>
          </div>

          {/* Second: adding (Add Shop / Add Category / Add Product) */}
          <div className="admin-management-navigation" style={{ marginTop: '10px' }}>
            <button
              className={entityType === 'shop' && viewMode === 'add' ? 'active' : ''}
              onClick={() => handleAddClick('shop')}
            >
              Add Shop
            </button>
            <button
              className={entityType === 'category' && viewMode === 'add' ? 'active' : ''}
              onClick={() => handleAddClick('category')}
            >
              Add Category
            </button>
            <button
              className={entityType === 'product' && viewMode === 'add' ? 'active' : ''}
              onClick={() => handleAddClick('product')}
            >
              Add Product
            </button>
          </div>

          {/* 1) Shops view */}
          {entityType === 'shop' && viewMode === 'view' && (
            <div className="admin-section">
              <h2>Shops List</h2>
              <div className="admin-cards-container">
                {shops.length > 0 ? (
                  shops.map(shop =>
                    editingShopId === shop.id ? (
                      <div key={shop.id} className="admin-form-card">
                        <h3>Edit Shop</h3>
                        <div className="form-group">
                          <label>Shop Name</label>
                          <input
                            type="text"
                            value={editShopData.name}
                            onChange={(e) =>
                              setEditShopData({ ...editShopData, name: e.target.value })
                            }
                          />
                        </div>
                        <div className="form-group">
                          <label>Shop Link</label>
                          <input
                            type="text"
                            value={editShopData.nameLink}
                            onChange={(e) =>
                              setEditShopData({ ...editShopData, nameLink: e.target.value })
                            }
                          />
                        </div>
                        <div className="form-group">
                          <label>Description</label>
                          <input
                            type="text"
                            value={editShopData.description}
                            onChange={(e) =>
                              setEditShopData({ ...editShopData, description: e.target.value })
                            }
                          />
                        </div>
                        <div className="form-group">
                          <label>Picture URL</label>
                          <input
                            type="text"
                            value={editShopData.picture}
                            onChange={(e) =>
                              setEditShopData({ ...editShopData, picture: e.target.value })
                            }
                          />
                        </div>
                        <div className="form-group">
                          <label>Status</label>
                          <select
                            value={editShopData.status}
                            onChange={(e) =>
                              setEditShopData({ ...editShopData, status: e.target.value })
                            }
                          >
                            <option value="active">active</option>
                            <option value="disabled">disabled</option>
                            <option value="is_archived">is_archived</option>
                          </select>
                        </div>
                        <button onClick={() => handleUpdateShop(editShopData.id)}>Save</button>
                        <button onClick={cancelEditShop}>Cancel</button>
                      </div>
                    ) : (
                      <div key={shop.id} className="admin-card">
                        <p><strong>ID:</strong> {shop.id}</p>
                        <p><strong>Name:</strong> {shop.name}</p>
                        <p><strong>Link:</strong> {shop.nameLink}</p>
                        <p><strong>Description:</strong> {shop.description}</p>
                        <p><strong>Status:</strong> {shop.status}</p>
                        <button onClick={() => startEditShop(shop)}>Edit</button>
                        <button onClick={() => handleToggleShopStatus(shop)}>
                          {shop.status === 'active' ? 'Disable' : 'Enable'}
                        </button>
                        <button onClick={() => handleDeleteShop(shop.id)}>Delete</button>
                      </div>
                    )
                  )
                ) : (
                  <p>No shops found.</p>
                )}
              </div>
            </div>
          )}

          {/* 2) Categories view */}
          {entityType === 'category' && viewMode === 'view' && (
            <div className="admin-section">
              <h2>Categories List</h2>
              <div className="admin-cards-container">
                {categories.length > 0 ? (
                  categories.map(cat =>
                    editingCategoryId === cat.id ? (
                      <div key={cat.id} className="admin-form-card">
                        <h3>Edit Category</h3>
                        <div className="form-group">
                          <label>Select Shop</label>
                          <select
                            value={editCategoryData.shopId}
                            onChange={(e) =>
                              setEditCategoryData({ ...editCategoryData, shopId: e.target.value })
                            }
                          >
                            <option value="">-- choose shop --</option>
                            {shops.map((shop) => (
                              <option key={shop.id} value={shop.id}>
                                {shop.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Category Name</label>
                          <input
                            type="text"
                            value={editCategoryData.name}
                            onChange={(e) =>
                              setEditCategoryData({ ...editCategoryData, name: e.target.value })
                            }
                          />
                        </div>
                        <div className="form-group">
                          <label>Category Link</label>
                          <input
                            type="text"
                            value={editCategoryData.nameLink}
                            onChange={(e) =>
                              setEditCategoryData({ ...editCategoryData, nameLink: e.target.value })
                            }
                          />
                        </div>
                        <div className="form-group">
                          <label>Picture URL</label>
                          <input
                            type="text"
                            value={editCategoryData.picture}
                            onChange={(e) =>
                              setEditCategoryData({ ...editCategoryData, picture: e.target.value })
                            }
                          />
                        </div>
                        <div className="form-group">
                          <label>Description</label>
                          <input
                            type="text"
                            value={editCategoryData.description}
                            onChange={(e) =>
                              setEditCategoryData({ ...editCategoryData, description: e.target.value })
                            }
                          />
                        </div>
                        <div className="form-group">
                          <label>Status</label>
                          <select
                            value={editCategoryData.status}
                            onChange={(e) =>
                              setEditCategoryData({ ...editCategoryData, status: e.target.value })
                            }
                          >
                            <option value="active">active</option>
                            <option value="disabled">disabled</option>
                            <option value="is_archived">is_archived</option>
                          </select>
                        </div>
                        <button onClick={() => handleUpdateCategory(editCategoryData.id)}>Save</button>
                        <button onClick={cancelEditCategory}>Cancel</button>
                      </div>
                    ) : (
                      <div key={cat.id} className="admin-card">
                        <p><strong>ID:</strong> {cat.id}</p>
                        <p>
                          <strong>Shop:</strong>{' '}
                          {shops.find((shop) => shop.id === cat.shopId)?.name || cat.shopId}
                        </p>
                        <p><strong>Name:</strong> {cat.name}</p>
                        <p><strong>Description:</strong> {cat.description}</p>
                        <p><strong>Status:</strong> {cat.status}</p>
                        <button onClick={() => startEditCategory(cat)}>Edit</button>
                        <button onClick={() => handleToggleCategoryStatus(cat)}>
                          {cat.status === 'active' ? 'Disable' : 'Enable'}
                        </button>
                        <button onClick={() => handleDeleteCategory(cat.id)}>Delete</button>
                      </div>

                    )
                  )
                ) : (
                  <p>No categories found.</p>
                )}
              </div>
            </div>
          )}

          {/* 3) Products view */}
          {entityType === 'product' && viewMode === 'view' && (
            <div className="admin-section">
              <h2>Products List</h2>
              <div className="admin-cards-container">
                {products.length > 0 ? (
                  products.map(prod =>
                    editingProductId === prod.id ? (
                      <div key={prod.id} className="admin-form-card">
                        <h3>Edit Product</h3>
                        <div className="form-group">
                          <label>Select Shop</label>
                          <select
                            value={editProductData.shopId}
                            onChange={(e) => {
                              setEditProductData({ ...editProductData, shopId: e.target.value, categoryId: '' });
                              fetchCategoriesByShop(e.target.value);
                            }}
                          >
                            <option value="">-- choose shop --</option>
                            {shops.map((shop) => (
                              <option key={shop.id} value={shop.id}>
                                {shop.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Select Category</label>
                          <select
                            value={editProductData.categoryId}
                            onChange={(e) =>
                              setEditProductData({ ...editProductData, categoryId: e.target.value })
                            }
                          >
                            <option value="">-- choose category --</option>
                            {categoriesForSelectedShop.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Product Name</label>
                          <input
                            type="text"
                            value={editProductData.name}
                            onChange={(e) =>
                              setEditProductData({ ...editProductData, name: e.target.value })
                            }
                          />
                        </div>
                        <div className="form-group">
                          <label>Description</label>
                          <input
                            type="text"
                            value={editProductData.description}
                            onChange={(e) =>
                              setEditProductData({ ...editProductData, description: e.target.value })
                            }
                          />
                        </div>
                        <div className="form-group">
                          <label>Price RUB</label>
                          <input
                            type="number"
                            value={editProductData.price_rub}
                            onChange={(e) =>
                              setEditProductData({ ...editProductData, price_rub: e.target.value })
                            }
                          />
                        </div>
                        <div className="form-group">
                          <label>Price UAH</label>
                          <input
                            type="number"
                            value={editProductData.price_uah}
                            onChange={(e) =>
                              setEditProductData({ ...editProductData, price_uah: e.target.value })
                            }
                          />
                        </div>
                        <div className="form-group">
                          <label>Price EUR</label>
                          <input
                            type="number"
                            value={editProductData.price_eur}
                            onChange={(e) =>
                              setEditProductData({ ...editProductData, price_eur: e.target.value })
                            }
                          />
                        </div>
                        <div className="form-group">
                          <label>Price BF Coin</label>
                          <input
                            type="number"
                            value={editProductData.price_bufferkacoin}
                            onChange={(e) =>
                              setEditProductData({ ...editProductData, price_bufferkacoin: e.target.value })
                            }
                          />
                        </div>
                        <div className="form-group">
                          <label>Stock</label>
                          <input
                            type="number"
                            value={editProductData.stock}
                            onChange={(e) =>
                              setEditProductData({ ...editProductData, stock: e.target.value })
                            }
                          />
                        </div>
                        <div className="form-group">
                          <label>Picture URL</label>
                          <input
                            type="text"
                            value={editProductData.picture}
                            onChange={(e) =>
                              setEditProductData({ ...editProductData, picture: e.target.value })
                            }
                          />
                        </div>
                        <div className="form-group">
                          <label>Picture Compressed URL</label>
                          <input
                            type="text"
                            value={editProductData.picture_compressed}
                            onChange={(e) =>
                              setEditProductData({ ...editProductData, picture_compressed: e.target.value })
                            }
                          />
                        </div>
                        <div className="form-group">
                          <label>Status</label>
                          <select
                            value={editProductData.status}
                            onChange={(e) =>
                              setEditProductData({ ...editProductData, status: e.target.value })
                            }
                          >
                            <option value="active">active</option>
                            <option value="disabled">disabled</option>
                            <option value="is_archived">is_archived</option>
                          </select>
                        </div>
                        <button onClick={() => handleUpdateProduct(editProductData.id)}>Save</button>
                        <button onClick={cancelEditProduct}>Cancel</button>
                      </div>
                    ) : (
                      <div key={prod.id} className="admin-card">
                        <p><strong>ID:</strong> {prod.id}</p>
                        <p>
                          <strong>Category:</strong>{' '}
                          {
                            categories.find((cat) => cat.id === prod.categoryId)?.name ||
                            prod.categoryId
                          }
                        </p>
                        <p>
                          <strong>Shop:</strong>{' '}
                          {
                            shops.find((shop) => {
                              const cat = categories.find((c) => c.id === prod.categoryId);
                              return cat && shop.id === cat.shopId;
                            })?.name || 'Not available'
                          }
                        </p>
                        <p><strong>Name:</strong> {prod.name}</p>
                        <p><strong>Description:</strong> {prod.description}</p>
                        <p><strong>Price RUB:</strong> {prod.price_rub}</p>
                        <p><strong>Price UAH:</strong> {prod.price_uah}</p>
                        <p><strong>Price EUR:</strong> {prod.price_eur}</p>
                        <p><strong>Price BF Coin:</strong> {prod.price_bufferkacoin}</p>
                        <p><strong>Stock:</strong> {prod.stock}</p>
                        <button onClick={() => startEditProduct(prod)}>Edit</button>
                        <button onClick={() => handleToggleProductStatus(prod)}>
                          {prod.status === 'active' ? 'Disable' : 'Enable'}
                        </button>
                        <button onClick={() => handleDeleteProduct(prod.id)}>Delete</button>
                      </div>
                    )
                  )
                ) : (
                  <p>No products found.</p>
                )}
              </div>
            </div>
          )}

          {/* Add forms. to add shops, categories, products */}
          {entityType === 'shop' && viewMode === 'add' && (
            <div className="admin-form-card">
              <h3>Add New Shop</h3>
              <div className="form-group">
                <label>Shop Name</label>
                <input
                  type="text"
                  value={newShop.name}
                  onChange={(e) => setNewShop({ ...newShop, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Shop Link</label>
                <input
                  type="text"
                  value={newShop.nameLink}
                  onChange={(e) => setNewShop({ ...newShop, nameLink: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  value={newShop.description}
                  onChange={(e) => setNewShop({ ...newShop, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Picture URL</label>
                <input
                  type="text"
                  value={newShop.picture}
                  onChange={(e) => setNewShop({ ...newShop, picture: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={newShop.status}
                  onChange={(e) => setNewShop({ ...newShop, status: e.target.value })}
                >
                  <option value="active">active</option>
                  <option value="disabled">disabled</option>
                  <option value="is_archived">is_archived</option>
                </select>
              </div>
              <button onClick={handleAddShop}>Add Shop</button>
            </div>
          )}
          {entityType === 'category' && viewMode === 'add' && (
            <div className="admin-form-card">
              <h3>Add New Category</h3>
              <div className="form-group">
                <label>Select Shop</label>
                <select
                  value={newCategory.shopId}
                  onChange={(e) => handleCategoryShopChange(e.target.value)}
                >
                  <option value="">-- choose shop --</option>
                  {shops.map((shop) => (
                    <option key={shop.id} value={shop.id}>
                      {shop.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Category Name</label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Category Link</label>
                <input
                  type="text"
                  value={newCategory.nameLink}
                  onChange={(e) => setNewCategory({ ...newCategory, nameLink: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Picture URL</label>
                <input
                  type="text"
                  value={newCategory.picture}
                  onChange={(e) => setNewCategory({ ...newCategory, picture: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={newCategory.status}
                  onChange={(e) => setNewCategory({ ...newCategory, status: e.target.value })}
                >
                  <option value="active">active</option>
                  <option value="disabled">disabled</option>
                  <option value="is_archived">is_archived</option>
                </select>
              </div>
              <button onClick={handleAddCategory}>Add Category</button>
            </div>
          )}
          {entityType === 'product' && viewMode === 'add' && (
            <div className="admin-form-card">
              <h3>Add New Product</h3>
              <div className="form-group">
                <label>Select Shop</label>
                <select
                  value={newProduct.shopId}
                  onChange={(e) => handleProductShopChange(e.target.value)}
                >
                  <option value="">-- choose shop --</option>
                  {shops.map((shop) => (
                    <option key={shop.id} value={shop.id}>
                      {shop.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Select Category</label>
                <select
                  value={newProduct.categoryId}
                  onChange={(e) => handleProductCategoryChange(e.target.value)}
                >
                  <option value="">-- choose category --</option>
                  {categoriesForSelectedShop.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Price RUB</label>
                <input
                  type="number"
                  value={newProduct.price_rub}
                  onChange={(e) => setNewProduct({ ...newProduct, price_rub: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Price UAH</label>
                <input
                  type="number"
                  value={newProduct.price_uah}
                  onChange={(e) => setNewProduct({ ...newProduct, price_uah: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Price EUR</label>
                <input
                  type="number"
                  value={newProduct.price_eur}
                  onChange={(e) => setNewProduct({ ...newProduct, price_eur: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Price BF Coin</label>
                <input
                  type="number"
                  value={newProduct.price_bufferkacoin}
                  onChange={(e) => setNewProduct({ ...newProduct, price_bufferkacoin: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Stock</label>
                <input
                  type="number"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Picture URL</label>
                <input
                  type="text"
                  value={newProduct.picture}
                  onChange={(e) => setNewProduct({ ...newProduct, picture: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Picture Compressed URL</label>
                <input
                  type="text"
                  value={newProduct.picture_compressed}
                  onChange={(e) => setNewProduct({ ...newProduct, picture_compressed: e.target.value })}
                />
              </div>
              <button onClick={handleAddProduct}>Add Product</button>
            </div>
          )}
        </>
      ) : (
        <p><strong>Please log in as admin to view admin panel</strong></p>
      )}
    </div>

  );

};

export default AdminShopManagementPage;
