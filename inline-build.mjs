import fs from 'node:fs';
let h=fs.readFileSync('dist/index.html','utf8');
h=h.replace(/<script type="module" crossorigin src="([^"]+)"><\/script>/,(_,p)=>'<script type="module">'+fs.readFileSync('dist/'+p.replace(/^\.\//,''),'utf8').replace(/<\/script/gi,'<\\/script')+'</script>');
h=h.replace(/<link rel="stylesheet" crossorigin href="([^"]+)">/,(_,p)=>'<style>'+fs.readFileSync('dist/'+p.replace(/^\.\//,''),'utf8')+'</style>');
fs.writeFileSync('dist/index.html',h);
