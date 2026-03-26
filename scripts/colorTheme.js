(function(){
    const select = document.getElementById('colortheme');
    if(!select) return;
    
    // Use absolute path from domain root to ensure it works in production
    fetch('/archive/palette.json')
        .then(r=>r.json())
        .then(data=>{
            // capture original gradient before applying any theme
            window.__originalGradient = getComputedStyle(document.documentElement).getPropertyValue('--gradient') || '';

            select.innerHTML = '';
            Object.keys(data).forEach(name=>{
                const opt = document.createElement('option');
                opt.value = name;
                opt.textContent = name;
                select.appendChild(opt);
            });

            const applyTheme = (name)=>{
                const vars = data[name] || {};
                Object.keys(vars).forEach(k=>{
                    document.documentElement.style.setProperty(k, vars[k]);
                });
                localStorage.setItem('colorTheme', name);

                // only adjust gradient for retro 2077 theme
                if(name === 'retro 2077') {
                    const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--bg-color').trim();
                    const decoColor = getComputedStyle(document.documentElement).getPropertyValue('--deco-color').trim();
                    const gradient = `linear-gradient(to bottom, ${bgColor} 80%, ${decoColor} 100%)`;
                    document.documentElement.style.setProperty('--gradient', gradient);
                } else {
                    // for all other themes, remove inline gradient so CSS definition applies with new colors
                    document.documentElement.style.removeProperty('--gradient');
                }
            };

            const saved = localStorage.getItem('colorTheme');
            let initial = null;
            if (saved && data[saved]) {
                initial = saved;
            } else {
                const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (!saved) {
                    if (prefersDark && data['retro 2077']) {
                        initial = 'retro 2077';
                    } else if (!prefersDark && data['sealed 7am']) {
                        initial = 'sealed 7am';
                    }
                }
                if (!initial) initial = Object.keys(data)[0];
            }

            if (initial) {
                select.value = initial;
                applyTheme(initial);
            }

            select.addEventListener('change', e=>{
                applyTheme(e.target.value);
            });
        })
        .catch(err=>{ console.warn('Could not load palette.json', err); });
})();
