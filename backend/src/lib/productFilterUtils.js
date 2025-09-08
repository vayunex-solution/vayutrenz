// utils/productFilterUtils.js
export const buildFilterQuery = (filterItems = {}) => {
    const query = {};

    for (const [key, values] of Object.entries(filterItems)) {
        if (!Array.isArray(values) || values.length === 0) continue;

        switch (key) {
            case 'Gender':
                query.gender = { $in: values.map(v => v==="MEN"?"male":v==="WOMEN"?"female":"unisex") };
                break;

            case 'Sizes':
                query.sizes = { $in: values };
                break;

            case 'Color':
                query.colors = { $in: values };
                break;

            case 'Sleeve':
                query['keyHighlights'] = { $elemMatch: { title: 'sleeve', value: { $in: values } } };
                break;

            case 'Neck':
                query['keyHighlights'] = { $elemMatch: { title: 'neck', value: { $in: values } } };
                break;

            case 'Ratings':
                const ratingThresholds = values.map(v => parseFloat(v));
                const minRating = Math.min(...ratingThresholds);
                query.rating = { $gte: minRating };
                break;

            case 'Discount':
                const numericDiscounts = values.map(v => parseInt(v));
                const minDiscount = Math.min(...numericDiscounts);
                query.discount = { $gte: minDiscount };
                break;

            case 'SortBy':
                // handled separately
                break;

            default:
                break;
        }
    }

    return query;
};

export const getSortOption = (sortBy = '') => {
    switch (sortBy) {
        case 'Price : High to Low':
            return { price: -1 };
        case 'Price : Low to High':
            return { price: 1 };
        case 'Popularity':
            return { likeNumbers: -1 };
        case 'New Arrival':
            return { createdAt: -1 };
        default:
            return { likeNumbers: -1 };
    }
};
