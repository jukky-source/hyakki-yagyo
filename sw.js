/* 百鬼夜行 - Service Worker (offline app shell) */
var CACHE = 'hyakki-v1';
var ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){
    return Promise.all(ASSETS.map(function(u){
      return c.add(u).catch(function(){ return null; });
    }));
  }));
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(ks){
      return Promise.all(ks.filter(function(k){ return k!==CACHE; }).map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(function(hit){
      if(hit) return hit;
      return fetch(e.request).then(function(res){
        try{
          if(res && res.status===200 && e.request.url.indexOf(self.location.origin)===0){
            var cl = res.clone();
            caches.open(CACHE).then(function(c){ c.put(e.request, cl); });
          }
        }catch(err){}
        return res;
      }).catch(function(){
        return caches.match('./index.html');
      });
    })
  );
});
