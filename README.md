# API

## Регистрация
### /auth/signin
- POST - Регистрация пользователя для сохранения в базу данных логина и хэша пароля
```
{
  login: userName,
  password: userPassword
}
```

## Авторизация
### /auth
- POST - Авторизация по логину и паролю
```
{
  login: userName,
  password: userPassword
}
```
В теле ответа вернется **token**

Для авторизованного доступа к API, необходимо в header Authorization каждого запроса прописать "Bearer **token**"

## Компании
### /companies
- GET - Получение списка всех компаний

*Доступные параметры:*
1. filter [status || type] Имя поля для фильтрации
2. value Значение фильтрации
2. sort [name || createdAt] Имя поля для сортировки
3. direction [asc || desc] Направление сортировки
4. page Страница в пагинации

- POST - Сохранение компании в базу данных

### /companies/:id
- GET - Получение компании по заданному id
- PATCH - Обновление данных о компании по заданному id

## Контакты
### /contacts
- GET - Получение списка контактов
- POST - Сохранение контакта в базе данных

### /contacts/:id
- GET - Получение контакта по заданному id
- PATCH - Обновление данных о контакте по заданному id
- DELETE - Удаление контакта по заданному id

# Запуск проекта

## Файлы базы данных
**dbdump** - Файл дампа баз данных лежит в корне проекта

## Запуск проекта
- Клонировать репозиторий 
```
git clone https://gitlab.com/devopsafs/test-tasks/test-api-js-backend.git
```
- Зайти в папку проекта
```
cd test-api-js-backend
```
- Перейти в ветку
```
git checkout zebzeev_an
```
- Установить зависимости
```
yarn || npm i
```
- Восстановить базу данных для разработки и для тестов из дампа
```
createdb -T template0 test
createdb -T template0 testdb
psql -f dbdump test /*Для разработки*/
psql -f dbdump testdb /*Для тестов*/
```
- Скопировать .env.example в .env
- Запустить тесты
```
npm run test | yarn test
```
- Запустить проект
```
npm run dev | yarn dev
npm start | yarn start
```
