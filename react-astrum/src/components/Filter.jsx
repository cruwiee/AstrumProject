import React from 'react';
import './Filter.css';

function Filter({ categories, onFilterChange }) {
    const handleFilterClick = (event, category) => {
        event.preventDefault();
        onFilterChange(category);
    };

    return (
        <section className="filter">
            <div className="filter-wrapper">
                <ul className="seperated-list">
                    <li>
                        <a
                            className="theme-all"
                            href="#"
                            onClick={(e) => handleFilterClick(e, '')}
                        >
                            ВСЕ
                        </a>
                    </li>
                    {categories.map(category => (
                        <li key={category.categoryId}>
                            <a
                                className={`theme-${category.name.toLowerCase()}`}
                                href="#"
                                onClick={(e) => handleFilterClick(e, category.categoryId)}
                            >
                                {category.name.toUpperCase()}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

export default Filter;