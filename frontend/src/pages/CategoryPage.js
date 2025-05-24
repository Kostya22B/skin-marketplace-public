// src/pages/CategoryPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ServiceInfoCard from '../components/ServiceInfoCard';
import UnderHeader from '../components/UnderHeader';
import './HomePage.css';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../utils/translateUtils';

const CategoryPage = () => {
    const { shopLink, categoryLink } = useParams();
    const [shop, setShop] = useState(null);
    const [category, setCategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { language } = useLanguage();

    useEffect(() => {
        const fetchCategoryData = async () => {
            try {
                const shopRes = await fetch('/user/shops/getActive');
                if (!shopRes.ok) throw new Error('Error loading shops');
                const shops = await shopRes.json();
                const currentShop = shops.find(item => item.nameLink === shopLink);
                if (!currentShop) {
                    setLoading(false);
                    return;
                }
                setShop(currentShop);

                const catRes = await fetch(`/user/categories/getActiveCategoriesInShop/${currentShop.id}`);
                if (!catRes.ok) throw new Error('Error loading categories');
                const cats = await catRes.json();
                const currentCategory = cats.find(cat => cat.nameLink === categoryLink);
                if (!currentCategory) {
                    setLoading(false);
                    return;
                }
                setCategory(currentCategory);

                const prodRes = await fetch(`/user/products/getActiveProductsInCategory/${currentCategory.id}`);
                if (!prodRes.ok) throw new Error('Error loading products');
                const prods = await prodRes.json();
                setProducts(prods);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryData();
    }, [shopLink, categoryLink]);

    if (loading) return <div>Loading...</div>;
    if (!shop) return <div>Shop not found</div>;
    if (!category) return <div>Category not found</div>;

    return (
        <div className="service-page">
            <UnderHeader title={category[`name_${language}`] || category.name} />
            <div className='content'>
                <div className="category-description">
                    <h2>{category[`description_${language}`] || category.description}</h2>
                </div>
            </div>
            <div className="services">
                {products.length ? (
                    products.map(product => (
                        <ServiceInfoCard key={product.id} productId={product.id} />
                    ))
                ) : (
                    <p>{t('NoProducts', language)}</p>
                )}
            </div>
        </div>
    );
};


export default CategoryPage;
