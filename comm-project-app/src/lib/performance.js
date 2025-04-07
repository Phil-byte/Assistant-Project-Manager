// src/lib/performance.js
/**
 * Utilitaires d'optimisation des performances pour l'application
 */

/**
 * Implémente une fonction de debounce pour limiter la fréquence d'exécution d'une fonction
 * @param {Function} func - La fonction à exécuter
 * @param {number} wait - Le délai d'attente en millisecondes
 * @returns {Function} - La fonction avec debounce
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Implémente une fonction de throttle pour limiter la fréquence d'exécution d'une fonction
 * @param {Function} func - La fonction à exécuter
 * @param {number} limit - Le délai minimum entre les exécutions en millisecondes
 * @returns {Function} - La fonction avec throttle
 */
export function throttle(func, limit = 300) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Implémente un cache en mémoire pour les résultats de fonction
 * @param {Function} fn - La fonction à mettre en cache
 * @param {Function} keyFn - Fonction pour générer la clé de cache (par défaut, utilise les arguments)
 * @param {number} ttl - Durée de vie du cache en millisecondes (par défaut, 5 minutes)
 * @returns {Function} - La fonction avec mise en cache
 */
export function memoize(fn, keyFn = JSON.stringify, ttl = 5 * 60 * 1000) {
  const cache = new Map();
  const expirations = new Map();

  return function memoized(...args) {
    const key = keyFn(args);
    
    // Vérifier si la valeur est en cache et non expirée
    if (cache.has(key) && expirations.get(key) > Date.now()) {
      return cache.get(key);
    }
    
    // Calculer la nouvelle valeur
    const result = fn.apply(this, args);
    
    // Si c'est une promesse, gérer le résultat de manière asynchrone
    if (result instanceof Promise) {
      return result.then(value => {
        cache.set(key, value);
        expirations.set(key, Date.now() + ttl);
        return value;
      });
    }
    
    // Sinon, mettre en cache directement
    cache.set(key, result);
    expirations.set(key, Date.now() + ttl);
    return result;
  };
}

/**
 * Optimise le chargement des images avec lazy loading
 * @param {string} selector - Sélecteur CSS pour les images à optimiser
 */
export function setupLazyLoading(selector = 'img.lazy') {
  if (typeof IntersectionObserver === 'undefined') {
    // Fallback pour les navigateurs qui ne supportent pas IntersectionObserver
    document.querySelectorAll(selector).forEach(img => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
      }
    });
    return;
  }

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.classList.remove('lazy');
        }
        observer.unobserve(img);
      }
    });
  });

  document.querySelectorAll(selector).forEach(img => {
    observer.observe(img);
  });
}

/**
 * Optimise les requêtes réseau en regroupant plusieurs appels en un seul
 * @param {Function} fetchFn - Fonction qui effectue la requête réseau
 * @param {number} delay - Délai d'attente avant d'exécuter le lot en millisecondes
 * @returns {Function} - Fonction qui regroupe les requêtes
 */
export function batchRequests(fetchFn, delay = 50) {
  let batch = [];
  let timeout = null;

  return function(params) {
    return new Promise((resolve, reject) => {
      batch.push({ params, resolve, reject });
      
      if (!timeout) {
        timeout = setTimeout(() => {
          const currentBatch = [...batch];
          batch = [];
          timeout = null;
          
          const allParams = currentBatch.map(item => item.params);
          
          fetchFn(allParams)
            .then(results => {
              // Distribuer les résultats aux promesses individuelles
              currentBatch.forEach((item, index) => {
                item.resolve(results[index]);
              });
            })
            .catch(error => {
              // Propager l'erreur à toutes les promesses
              currentBatch.forEach(item => {
                item.reject(error);
              });
            });
        }, delay);
      }
    });
  };
}

/**
 * Optimise le rendu des listes longues en ne rendant que les éléments visibles
 * @param {Array} items - Liste complète des éléments
 * @param {number} visibleItems - Nombre d'éléments visibles à la fois
 * @param {number} currentIndex - Index de départ
 * @param {number} buffer - Nombre d'éléments à charger en avance
 * @returns {Array} - Sous-ensemble des éléments à rendre
 */
export function virtualizeList(items, visibleItems = 10, currentIndex = 0, buffer = 5) {
  const start = Math.max(0, currentIndex - buffer);
  const end = Math.min(items.length, currentIndex + visibleItems + buffer);
  return items.slice(start, end);
}

/**
 * Optimise les performances en limitant le nombre de rendus
 * @param {Function} renderFn - Fonction de rendu
 * @param {number} fps - Nombre maximum de rendus par seconde
 * @returns {Function} - Fonction de rendu optimisée
 */
export function limitRenders(renderFn, fps = 30) {
  const interval = 1000 / fps;
  let lastRender = 0;
  let pendingRender = null;
  
  return function(...args) {
    const now = Date.now();
    const elapsed = now - lastRender;
    
    if (elapsed >= interval) {
      lastRender = now;
      renderFn(...args);
    } else {
      clearTimeout(pendingRender);
      pendingRender = setTimeout(() => {
        lastRender = Date.now();
        renderFn(...args);
      }, interval - elapsed);
    }
  };
}
