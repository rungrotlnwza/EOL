-- tb_auth
CREATE TABLE tb_auth (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user'
) ENGINE=InnoDB;

-- tb_detail
CREATE TABLE tb_detail (
  id INT PRIMARY KEY, -- ไม่ต้อง auto_increment
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  gender ENUM('male', 'female', 'other'),
  date_of_birth DATE,
  education VARCHAR(255),
  address TEXT,
  profile_image VARCHAR(255) DEFAULT NULL, -- เก็บชื่อไฟล์รูปโปรไฟล์
  FOREIGN KEY (id) REFERENCES tb_auth(id) ON DELETE CASCADE
) ENGINE=InnoDB;
