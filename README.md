
# Hasura-GraphQL-Allowlist-Registrar

## 무엇을 하나요?

레포지토리에 푸시할 때 해당 레포지토리 내부의 모든 .gql 파일을 찾아 Hasura allowlist에 등록해 줍니다.
기본 설정을 적용하였을 때는 매번 푸시할 때마다 작동합니다.

## 어떻게 사용하나요?

1. [workflow.example.yml](https://github.com/weareteamturing/hasura-graphql-allowlist-registrar/blob/master/workflow.example.yml) 파일을 다운로드 받습니다.
2. GraphQL 쿼리를 등록할 GitHub 레포지토리에 `.github/workflows` 폴더를 생성합니다.
3. 다운로드받은 파일의 이름을 `workflow.yml`로 변경 후 해당 폴더 안에 집어넣습니다.
4. Github Secrets에 `hasuraHost`와 `hasuraKey`를 등록합니다. (https://github.com/레포이름/settings/secrets) 또는 레포 홈 -> settings -> secrets
  - hasuraHost: Hasura 서버 URL
  - hasuraKey: Hasura 서버 Admin Secret

이후 repository push 시점마다 workflow가 실행이 됩니다.
