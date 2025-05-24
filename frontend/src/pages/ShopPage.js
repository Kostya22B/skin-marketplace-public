// src/pages/ShopPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ServiceCard from '../components/ServiceCard';
import UnderHeader from '../components/UnderHeader';
import './HomePage.css';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../utils/translateUtils';

const ShopPage = () => {
    const { shopLink } = useParams();
    const [shop, setShop] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const { language } = useLanguage();

    useEffect(() => {
        const fetchShopData = async () => {
            try {
                const shopRes = await fetch('/user/shops/getActive');
                if (!shopRes.ok) throw new Error('Error getting shops');
                const shops = await shopRes.json();
                const currentShop = shops.find(item => item.nameLink === shopLink);
                if (!currentShop) {
                    setLoading(false);
                    return;
                }
                setShop(currentShop);
                const catRes = await fetch(`/user/categories/getActiveCategoriesInShop/${currentShop.id}`);
                if (!catRes.ok) throw new Error('Error getting shops');
                const cats = await catRes.json();
                setCategories(cats);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchShopData();
    }, [shopLink]);

    if (loading) return <div>Loading...</div>;
    if (!shop) return <div>Shop was not found</div>;

    return (
        <div className="service-page">
            <UnderHeader title={shop[`name_${language}`] || shop.name} />
            <div className='content'>
                <div className="shop-description">
                    <h2>{shop[`description_${language}`] || shop.description}</h2>
                </div>
            </div>

            <div className="services">
                {categories.map(category => (
                    <ServiceCard
                        key={category.id}
                        image={category.picture || '/img/default_category.jpg'}
                        title={category[`name_${language}`] || category.name}
                        description={category[`description_${language}`] || category.description}
                        link={`/${shop.nameLink}/${category.nameLink}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default ShopPage;
