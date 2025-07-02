export async function loadComponent(id, filename) {
  const el = document.getElementById(id);
  if (!el) {
    console.log(`Element with id '${id}' not found`);
    return;
  }
  try {
    const res = await fetch(`/assets/components/${filename}`);
    const html = await res.text();
    el.innerHTML = html;
    console.log(`Component '${filename}' loaded successfully into '${id}'`);
  } catch (err) {
    console.error(`Failed to load component '${filename}':`, err);
  }
}
