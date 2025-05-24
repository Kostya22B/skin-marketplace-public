// AdminPanelPage.js
import React, { useEffect, useState } from 'react';
import { VscArrowRight, VscArrowLeft, VscSearch } from "react-icons/vsc";
import { toast } from 'sonner';
import '../profile/ProfilePage.css';
import './AdminPanelPage.css';
import UnderHeader from '../../components/UnderHeader';

const AdminPanelPage = () => {
  const [user, setUser] = useState(null);

  const [carts, setCarts] = useState([]);
  const [selectedCartStatus, setSelectedCartStatus] = useState({});
  const [purchases, setPurchases] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState('');

  // New coin states:
  const [activeSection, setActiveSection] = useState('profile'); // 'profile' | 'orders' | 'carts' | 'coins'
  const [coinsActiveSubSection, setCoinsActiveSubSection] = useState('transactions'); // 'transactions' or 'add'
  const [coinsTransactions, setCoinsTransactions] = useState([]);
  const [searchUserEmail, setSearchUserEmail] = useState('');
  const [foundUser, setFoundUser] = useState(null);
  const [coinsToAdd, setCoinsToAdd] = useState('');

  // User data
  useEffect(() => {
    fetch('/api/user', { credentials: 'include' })
      .then(res => res.json())
      .then(userData => {
        if (userData && userData.id && userData.role === 'admin') {
          setUser(userData);
          fetchOrders();
        } else {
          setUser(null);
          throw new Error('User not authenticated');
        }
      })
      .catch(error => {
        toast.error('Error fetching user data');
        setUser(null);
      });
  }, []);

  // Getting orders
  const fetchOrders = async () => {
    try {
      const response = await fetch(
        `/orders/admin/readAll?search=${searchTerm}&page=${currentPage}&limit=6`,
        { credentials: 'include' }
      );
      const data = await response.json();
      if (data.orders) {
        setPurchases(data.orders);
        setTotalPages(data.totalPages);
      }
      toast.success('Orders succesfully fetched!');
    } catch (error) {
      toast.error('Error fetching orders');
    }
  };

  // Getting cart
  const fetchCarts = async () => {
    try {
      const response = await fetch(`/cart/admin/readAll?search=${searchTerm}`, { credentials: 'include' });
      const data = await response.json();
      if (data.carts) setCarts(data.carts);
      toast.success('Carts succesfully fetched!');
    } catch (error) {
      toast.error('Error fetching carts');
    }
  };

  // Getting coins transactions
  const fetchCoinsTransactions = async () => {
    try {
      const response = await fetch(`/coins/admin/transactions`, { credentials: 'include' });
      const data = await response.json();
      if (data.transactions) {
        setCoinsTransactions(data.transactions);
      }
    } catch (error) {
      toast.error('Error fetching coin transactions');
    }
  };

  // Section: orders, carts, coins etc..
  useEffect(() => {
    if (activeSection === 'orders') {
      fetchOrders();
    } else if (activeSection === 'carts') {
      fetchCarts();
    } else if (activeSection === 'coins' && coinsActiveSubSection === 'transactions') {
      fetchCoinsTransactions();
    }
  }, [activeSection, searchTerm, currentPage, coinsActiveSubSection]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (activeSection === 'orders') fetchOrders();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success(`Order "${text}" copied.`);
      })
      .catch(err => {
        console.error('Copy error:', err);
        toast.error('Error during copying oredr.');
      });
  };

  const handleStatusChange = (e, orderId) => {
    setSelectedStatus(e.target.value);
  };

  const handleUpdateStatus = async (orderId) => {
    try {
      if (!selectedStatus) {
        toast.error('Choose status!');
        return;
      }
      const response = await fetch('/orders/admin/updateStatus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ orderId, newStatus: selectedStatus }),
      });
      const data = await response.json();
      if (response.ok) {
        setPurchases(prev =>
          prev.map(purchase => purchase.id === orderId ? { ...purchase, status: selectedStatus } : purchase)
        );
        toast.success('Order state succesfully updated');
      } else {
        toast.error(data.message || 'Error during status update');
      }
    } catch (error) {
      console.error('Error during status update:', error);
      toast.error('Error during status update');
    }
  };

  const handleUpdateCartStatus = async (cartId) => {
    try {
      const newStatus = selectedCartStatus[cartId];
      if (!newStatus) {
        toast.error('Выберите статус');
        return;
      }
      const response = await fetch('/cart/admin/updateStatus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ cartId, newStatus }),
      });
      if (response.ok) {
        setCarts(prevCarts => prevCarts.map(cart =>
          cart.id === cartId ? { ...cart, status: newStatus } : cart
        ));
        toast.success('Cart status succsfully updated');
      } else {
        toast.error('Error during cart status update');
      }
    } catch (error) {
      console.error('Error during cart update:', error);
      toast.error('Error during cart update');
    }
  };

  const handleSearchUser = async () => {
    try {
      const response = await fetch(`/coins/admin/searchUser?email=${encodeURIComponent(searchUserEmail)}`, { credentials: 'include' });
      const text = await response.text();
      const data = JSON.parse(text);
      if (response.ok && data.user) {
        setFoundUser(data.user);
        toast.success('User found');
      } else {
        setFoundUser(null);
        toast.error(data.message || 'User was not found');
      }
    } catch (error) {
      console.error('Error during searching user:', error);
      toast.error('Error during searching user');
    }
  };

  const handleAddCoins = async () => {
    if (!coinsToAdd || isNaN(coinsToAdd) || parseFloat(coinsToAdd) <= 0) {
      toast.error('Input correct coins value');
      return;
    }
    try {
      const response = await fetch('/coins/admin/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId: foundUser.id, coins: coinsToAdd }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Coins succesfully added to user');
        setFoundUser(null);
        setCoinsToAdd('');
      } else {
        toast.error(data.message || 'Error during adding coins');
      }
    } catch (error) {
      console.error('Error during adding coins:', error);
      toast.error('Error during adding coins');
    }
  };

  return (
    <div className="profile-page">
      <UnderHeader title="Admin Panel" />

      {/* Head section navigation */}
      {user ? (
        <><div className="profile-navigation">
          <button className={activeSection === 'profile' ? 'active' : ''} onClick={() => setActiveSection('profile')}>Profile</button>
          <button className={activeSection === 'orders' ? 'active' : ''} onClick={() => setActiveSection('orders')}>Orders</button>
          <button className={activeSection === 'carts' ? 'active' : ''} onClick={() => setActiveSection('carts')}>Carts</button>
          <button className={activeSection === 'coins' ? 'active' : ''} onClick={() => { setActiveSection('coins'); setCoinsActiveSubSection('transactions'); }}>BF Coins</button>
        </div><div className="user-purchase-content">
            {activeSection === 'profile' ? (
              <div className="profile-info">
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Your bufferka coins:</strong> {user.coinsBalance}</p>
                <div className="telegram-section">
                  <p><strong>TG nickname:</strong></p>
                </div>
                <p><strong>Telegram ID:</strong> {user.telegramId}</p>
              </div>
            ) : activeSection === 'orders' ? (
              <div className="user-purchases">
                <h2>Purchases</h2>
                {activeSection === 'orders' && (
                  <div style={{ marginTop: '10px', textAlign: 'center' }}>
                    <button
                      className="export-button"
                      onClick={() => {
                        fetch('/orders/admin/export', { credentials: 'include' })
                          .then(res => {
                            if (!res.ok) throw new Error('Failed to export');
                            return res.blob();
                          })
                          .then(blob => {
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'purchases_report.xlsx';
                            a.click();
                          })
                          .catch(err => {
                            console.error('Export error:', err);
                            toast.error('Export error');
                          });
                      }}
                    >
                      📥 Download excel report for last month
                    </button>
                  </div>
                )}

                <form onSubmit={handleSearchSubmit} className='control-panel'>
                  <input
                    type="text"
                    placeholder="Поиск по ID заказа или email"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className='filter-input' />
                  <button type="submit" className='search-button'>
                    <VscSearch style={{ width: '2em', height: '2em' }} />
                  </button>
                </form>
                {purchases.length > 0 ? (
                  <div className="purchases-container">
                    {purchases.map(purchase => (
                      <div key={purchase.id} className="purchase-card">
                        <div className="purchase-header">
                          <p><strong>Order ID:</strong> {purchase.id}</p>
                          <button className="copy-id-button" onClick={() => copyToClipboard(purchase.id)}></button>
                        </div>
                        <div className="purchase-content">
                          <p className='id_email'><strong>User email:</strong> {purchase.User?.email}</p>
                          <p><strong>Products:</strong></p>
                          <ul>
                            {purchase.items && purchase.items.length > 0 ? (
                              purchase.items.map((item, index) => (
                                <li key={index}>
                                  <strong>{item.Product.name}</strong> (x{item.quantity}) - {item.status}
                                </li>
                              ))
                            ) : (
                              <li>No items in this order.</li>
                            )}
                          </ul>
                          <p><strong>Date of last renew:</strong>
                            {purchase.updatedAt}
                          </p>
                          {purchase.appliedCoupon && (
                            <p><strong>Applied coupon:</strong> {purchase.appliedCoupon.code} (-{purchase.appliedCoupon.discountValue}%)</p>
                          )}
                          <p className='money-amount'><strong>Total:</strong> {purchase.total} {purchase.currency}</p>
                          <p className='universal-date'><strong>Purchase state:</strong> {purchase.status}</p>
                        </div>
                        <div className="purchase-footer">
                          <select value={selectedStatus} onChange={(e) => handleStatusChange(e, purchase.id)} style={{ padding: '5px', marginRight: '10px' }}>
                            <option value="">Chhose status</option>
                            <option value="paid">Paid</option>
                            <option value="expired">Expired</option>
                            <option value="processing after payment">Processing After Payment</option>
                            <option value="delivered">Delivered</option>
                          </select>
                          <button
                            onClick={() => handleUpdateStatus(purchase.id)}
                            style={{ padding: '5px 10px', backgroundColor: '#4fd1c5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            Renew
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No purchases found.</p>
                )}
                <div className='control-panel'>
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    style={{ padding: '5px 10px', marginRight: '10px', backgroundColor: currentPage === 1 ? '#666' : '#4fd1c5', color: 'white', border: 'none', borderRadius: '4px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                  >
                    <VscArrowLeft style={{ width: '10vh', height: '4vh' }} />
                  </button>
                  <span>Page {currentPage} of {totalPages}</span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    style={{ padding: '5px 10px', marginLeft: '10px', backgroundColor: currentPage === totalPages ? '#666' : '#4fd1c5', color: 'white', border: 'none', borderRadius: '4px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                  >
                    <VscArrowRight style={{ width: '10vh', height: '4vh' }} />
                  </button>
                </div>
              </div>
            ) : activeSection === 'carts' ? (
              <div className="user-carts">
                <h2>Carts</h2>
                <div className="purchases-container">
                  {carts.length > 0 ? (
                    carts.map(cart => (
                      <div key={cart.id} className="purchase-card">
                        <p><strong>User email:</strong> {cart.User?.email}</p>
                        <p><strong>Products:</strong></p>
                        <ul>
                          {cart.items.map((item, index) => (
                            <li key={index}><strong>{item.Product.name}</strong> (x{item.quantity})</li>
                          ))}
                        </ul>
                        <p><strong>Cart state:</strong> {cart.status}</p>
                        <select value={selectedCartStatus[cart.id] || ''} onChange={(e) => setSelectedCartStatus(prev => ({ ...prev, [cart.id]: e.target.value }))}>
                          <option value="">Choose status</option>
                          <option value="active">Active</option>
                          <option value="delivered">Delivered</option>
                        </select>
                        <button onClick={() => handleUpdateCartStatus(cart.id)}>Обновить</button>
                      </div>
                    ))
                  ) : (
                    <p>No carts found.</p>
                  )}
                </div>
              </div>
            ) : activeSection === 'coins' ? (
              <div className="user-coins">
                {/* Internal navigation */}
                <div className="coins-navigation">
                  <button
                    className={coinsActiveSubSection === 'transactions' ? 'active' : ''}
                    onClick={() => setCoinsActiveSubSection('transactions')}
                  >
                    Transactions
                  </button>
                  <button
                    className={coinsActiveSubSection === 'add' ? 'active' : ''}
                    onClick={() => { setCoinsActiveSubSection('add'); setFoundUser(null); setSearchUserEmail(''); }}
                  >
                    Add coins
                  </button>
                </div>
                {coinsActiveSubSection === 'transactions' ? (
                  <div>
                    <h2>Bufferka coins transactions</h2>
                    <div className="coins-transactions">
                      {coinsTransactions.length > 0 ? (
                        coinsTransactions.map(tx => (
                          <div key={tx.id} className="coins-transaction-card">
                            <div className="coins-transaction-header">
                              <p>
                                <strong>Transaction Id:</strong> {tx.id}
                              </p>
                              <button className="copy-id-button" onClick={() => copyToClipboard(tx.id)}></button>
                            </div>
                            <div className="coins-transaction-content">
                              <p className='id_email'>
                                <strong>Admin:</strong> {tx.Admin?.email}
                              </p>
                              <p className='id_email'>
                                <strong>User:</strong> {tx.User?.email}
                              </p>
                              <p className='money-amount'>
                                <strong>Coins:</strong> {tx.coins}
                              </p>
                              <p className='universal-date'>
                                <strong>ДатDateа:</strong> {new Date(tx.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p>No transactions</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="coins-add">
                    <h2>Search user for adding coins</h2>
                    <div className="search-user">
                      <input
                        type="email"
                        placeholder="Введите email пользователя"
                        value={searchUserEmail}
                        onChange={(e) => setSearchUserEmail(e.target.value)} />
                      <button onClick={handleSearchUser}>
                        <VscSearch style={{ width: '2em', height: '2em' }} />
                      </button>
                    </div>
                    {foundUser && (
                      <div className="user-card">
                        <p><strong>Email:</strong> {foundUser.email}</p>
                        <p><strong>TG ID:</strong> {foundUser.telegramId || 'Not set'}</p>
                        <p><strong>COins balance:</strong> {foundUser.coinsBalance}</p>
                        <div className="add-coins-form">
                          <label>
                            Input coins count:
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={coinsToAdd}
                              onChange={(e) => setCoinsToAdd(e.target.value)} />
                          </label>
                          <button onClick={handleAddCoins}>Send coins</button>
                        </div>
                      </div>
                    )}
                  </div>

                )}
              </div>
            ) : (null)}
          </div></>
      ) : (
        <p><strong>Please log in as admin to view admin panel</strong></p>
      )}
    </div>
  );
};

export default AdminPanelPage;
