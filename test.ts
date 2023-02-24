import { assertEquals } from "https://deno.land/std@0.178.0/testing/asserts.ts";
import { get_zone_name_from_dns_name } from "./get_zone_name_from_dns_name.ts";

Deno.test("get_zone_name_from_dns_name", () => {
    const dns_name = "example.com";
    const zone_name = "example.com";
    const result = get_zone_name_from_dns_name(dns_name);
    assertEquals(result, zone_name);
    assertEquals("vercel.app", get_zone_name_from_dns_name("hello.vercel.app"));
    assertEquals(
        "vercel.app",
        get_zone_name_from_dns_name("hello.test.world.vercel.app"),
    );
});
