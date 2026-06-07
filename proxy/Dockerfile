# Nginx 리버스 프록시 + 정적 파일 서빙 컨테이너
FROM nginx:1.27-alpine

# 기본 설정 제거 후 우리 설정 적용
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/nginx.conf

# 미리 빌드된 React 정적 자산(frontend 빌드 결과)을 복사
# → frontend 에서 `npm run build` 하면 ../proxy/static/dist 에 생성됩니다.
COPY static/dist /usr/share/nginx/html

EXPOSE 80
