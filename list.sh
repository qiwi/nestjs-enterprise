#array=(common config connection-provider consul facade logger mdc svc-info thrift)

count=10
for i in $(seq $count); do
    yarn jest
done
