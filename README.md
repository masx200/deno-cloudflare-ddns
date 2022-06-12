# deno-cloudflare-ddns

deno-cloudflare-ddns

适用于deno 的 cloudflare ddns 客户端,支持ipv6和ipv4，自动获取本机的公共ip地址

https://deno.land/x/masx200_deno_cloudflare_ddns/mod.ts

`startIpv6DDNS`:开始定时更新IPV6的DNS的AAAA类型记录

`startIpv4DDNS`:开始定时更新IPV4的DNS的A类型的记录

`createOrPatchDNSRecord`:根据dns记录的名字和类型查找，创建或者更新DNS记录。

`get_zone_id_of_name`:根据`zone`的名字查找`zone`的`id`

`get_dns_record_id_of_name_type`:根据`dns_record`的名字和类型查找`dns_record`的`id`
