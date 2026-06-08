FROM php:8.2-apache

# 安装PDO MySQL扩展
RUN docker-php-ext-install pdo pdo_mysql

# 启用Apache Rewrite模块
RUN a2enmod rewrite headers

# 设置工作目录
WORKDIR /var/www/html

# 更改Apache配置以允许.htaccess覆盖
RUN sed -i '/<Directory \/var\/www\/>/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

# 复制源代码（在docker-compose中也会挂载，但这里复制是为了构建镜像）
COPY . /var/www/html/

# 设置权限
RUN chown -R www-data:www-data /var/www/html
