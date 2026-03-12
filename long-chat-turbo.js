(() => {
  const KEEP_LAST = 20;
  const articles = [...document.querySelectorAll('#thread article[data-testid^="conversation-turn-"]')];
  const remove = articles.slice(0, -KEEP_LAST);
  remove.forEach(n => n.remove());
  console.log(`Removed ${remove.length} old turns, kept ${Math.min(KEEP_LAST, articles.length)}.`);
})();
