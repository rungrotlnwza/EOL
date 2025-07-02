// ระบบ CDN Loading
function loadCDN(type, url) {
  return new Promise((resolve, reject) => {
    // ตรวจสอบว่าโหลดแล้วหรือยัง
    if (type === 'css') {
      // ตรวจสอบว่า CSS โหลดแล้วหรือยัง
      if (document.querySelector(`link[href="${url}"]`)) {
        console.log(`CSS already loaded: ${url}`);
        return resolve();
      }
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      link.onload = () => {
        console.log(`CSS loaded: ${url}`);
        resolve();
      };
      link.onerror = () => {
        console.error(`Failed to load CSS: ${url}`);
        reject(new Error(`Failed to load CSS: ${url}`));
      };
      document.head.appendChild(link);
    } else if (type === 'js') {
      // ตรวจสอบว่า JS โหลดแล้วหรือยัง
      if (document.querySelector(`script[src="${url}"]`)) {
        console.log(`Script already loaded: ${url}`);
        return resolve();
      }
      const script = document.createElement('script');
      script.src = url;
      script.onload = () => {
        console.log(`Script loaded: ${url}`);
        resolve();
      };
      script.onerror = () => {
        console.error(`Failed to load script: ${url}`);
        reject(new Error(`Failed to load script: ${url}`));
      };
      document.body.appendChild(script);
    } else {
      reject(new Error(`Unsupported type: ${type}. Use 'css' or 'js'`));
    }
  });
}

// Export ฟังก์ชัน
export { loadCDN };
