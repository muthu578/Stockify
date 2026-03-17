import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
    en: {
        dashboard: "Business Dashboard",
        inventory: "Stock Control",
        billing: "Revenue & Billing",
        reports: "Analytics",
        administration: "Administration",
        procurement: "Procurement",
        manufacturing: "Manufacturing",
        hr_payroll: "HR & Payroll",
        financials: "Financials",
        search: "Search products, orders, or suppliers...",
        welcome: "Welcome back",
        totalSales: "Total Sales",
        lowStock: "Low Stock",
        notifications: "Notifications",
        profile: "My Profile",
        settings: "Account Settings",
        help: "Help Center",
        logout: "Sign Out",
        alerts: "Alerts",
        fullscreen: "Fullscreen",
        language: "Language",
        pos: "POS (Billing)",
        performa: "Performa Invoice",
        challan: "Delivery Challan",
        notes: "Credit/Debit Notes",
        insights: "Sales Insights",
        po_gen: "PO Generation",
        grn: "GRN Entry",
        product_master: "Product Master",
        live_inventory: "Live Inventory",
        transfer: "Stock Transfer",
        machines: "Machine Registry",
        production_flow: "Production Flow",
        exec_report: "Executive Report",
        daily_snap: "Daily Stock Snap",
        valuation: "Valuation Report",
        batch_track: "Batch Tracking",
        storage: "Storage Units",
        categories: "Categories",
        users: "User Directory",
        customers: "Customer Hub",
        vendors: "Vendor Hub",
        app_settings: "App Settings"
    },
    fr: {
        dashboard: "Tableau de Bord",
        inventory: "Contrôle des Stocks",
        billing: "Revenu et Facturation",
        reports: "Analytique",
        administration: "Administration",
        procurement: "Approvisionnement",
        manufacturing: "Fabrication",
        hr_payroll: "RH et Paie",
        financials: "Finances",
        search: "Rechercher des produits, commandes ou fournisseurs...",
        welcome: "Bon retour",
        totalSales: "Ventes Totales",
        lowStock: "Stock Faible",
        notifications: "Notifications",
        profile: "Mon Profil",
        settings: "Paramètres du Compte",
        help: "Centre d'Aide",
        logout: "Se déconnecter",
        alerts: "Alertes",
        fullscreen: "Plein Écran",
        language: "Langue",
        pos: "PDV (Facturation)",
        performa: "Facture Proforma",
        challan: "Bon de Livraison",
        notes: "Notes de Crédit/Débit",
        insights: "Aperçu des Ventes",
        po_gen: "Génération de BC",
        grn: "Entrée de Réception",
        product_master: "Catalogue Produits",
        live_inventory: "Stock en Direct",
        transfer: "Transfert de Stock",
        machines: "Registre des Machines",
        production_flow: "Flux de Production",
        exec_report: "Rapport Exécutif",
        daily_snap: "Instantané Stock",
        valuation: "Rapport de Valorisation",
        batch_track: "Suivi de Lot",
        storage: "Unités de Stockage",
        categories: "Catégories",
        users: "Répertoire Utilisateurs",
        customers: "Centre Clients",
        vendors: "Centre Fournisseurs",
        app_settings: "Paramètres App"
    }
};

export const LanguageProvider = ({ children }) => {
    const [lang, setLang] = useState(localStorage.getItem('lang') || 'en');

    useEffect(() => {
        localStorage.setItem('lang', lang);
    }, [lang]);

    const t = (key) => translations[lang][key] || key;

    const toggleLanguage = () => {
        setLang(prev => prev === 'en' ? 'fr' : 'en');
    };

    return (
        <LanguageContext.Provider value={{ lang, setLang, t, toggleLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
