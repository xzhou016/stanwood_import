// Load jQuery globally, and plugins
import 'babel-polyfill';
import './theme/global/jquery';
import 'jquery-trend';
import 'jquery-revealer';

import stencilUtils from '@bigcommerce/stencil-utils';
import async from 'async';
import Account from './theme/core/Account';
import Auth from './theme/Auth';
import Blog from './theme/Blog';
import Brand from './theme/Brand';
import Brands from './theme/Brands';
import Cart from './theme/Cart';
import Category from './theme/Category';
import Compare from './theme/Compare';
import Errors from './theme/Errors';
import GiftCertificate from './theme/GiftCertificate';
import Global from './theme/Global';
import Home from './theme/Home';
import OrderComplete from './theme/OrderComplete';
import Page from './theme/Page';
import Product from './theme/Product';
import Search from './theme/Search';
import Sitemap from './theme/Sitemap';
import Subscribe from './theme/Subscribe';
import Unsubscribe from './theme/Subscribe';
import Wishlist from './theme/Wishlist';

const PageClasses = {
  'global': Global,
  'pages/account/orders/all': Account,
  'pages/account/orders/details': Account,
  'pages/account/addresses': Account,
  'pages/account/add-address': Account,
  'pages/account/add-return': Account,
  'pages/account/add-wishlist': Wishlist,
  'pages/account/recent-items': Account,
  'pages/account/download-item': Account,
  'pages/account/edit': Account,
  'pages/account/inbox': Account,
  'pages/account/return-saved': Account,
  'pages/account/returns': Account,
  'pages/auth/login': Auth,
  'pages/auth/account-created': Auth,
  'pages/auth/create-account': Auth,
  'pages/auth/new-password': Auth,
  'pages/blog': Blog,
  'pages/blog-post': Blog,
  'pages/brand': Brand,
  'pages/brands': Brands,
  'pages/cart': Cart,
  'pages/category': Category,
  'pages/compare': Compare,
  'pages/errors': Errors,
  'pages/gift-certificate/purchase': GiftCertificate,
  'pages/gift-certificate/balance': GiftCertificate,
  'pages/gift-certificate/redeem': GiftCertificate,
  'pages/home': Home,
  'pages/order-complete': OrderComplete,
  'pages/page': Page,
  'pages/product': Product,
  'pages/search': Search,
  'pages/sitemap': Sitemap,
  'pages/subscribe': Subscribe,
  'pages/unsubscribe': Subscribe,
  'pages/account/wishlist-details': Wishlist,
  'pages/account/wishlists': Wishlist,
};

/**
 * This function gets added to the global window and then called
 * on page load with the current template loaded and JS Context passed in
 * @param templateFile String
 * @param context
 */

window.stencilBootstrap = function stencilBootstrap(templateFile, context = {}) {
  const globalClass = PageClasses['global'];
  const pageClass = PageClasses[templateFile];

  context = JSON.parse(context);
  $(() => {
    new globalClass(context);

    if (pageClass) {
      new pageClass(context);
    }
  });
};
