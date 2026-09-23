/* MOZZIPICK V3.1
 * Legacy static seed products were removed.
 * Product UI is now driven only by data/products.json via the V3.1 platform/menu renderers.
 */
(()=>{
  const ranking=document.querySelector("#ranking");
  if(ranking) ranking.innerHTML="";
  const detail=document.querySelector("#detail");
  if(detail) detail.innerHTML="";
})();
