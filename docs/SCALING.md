# Scaling to 1,000+ concurrent video users

Short summary of how to scale beyond a single call: **P2P vs SFU vs MCU** and where to run servers.

## P2P (peer-to-peer)

- **What:** Each participant sends their stream directly to every other participant (mesh). No central media server.
- **Pros:** Simple, low latency, no server cost for media.
- **Cons:** Upload/download grows with participant count (e.g. 10 people ≈ 9× upload per peer). Doesn’t scale to large rooms.
- **When:** Small groups (e.g. 2–6 people). Good for 1:1 or tiny meetings.

## SFU (Selective Forwarding Unit)

- **What:** A server receives each participant’s stream and forwards it to others. Server does not decode/mix; it only forwards (selectively) what each client needs.
- **Pros:** Scales well (1,000+ users in one room is feasible). Lower server CPU than MCU. Clients can subscribe to a subset of streams (e.g. “active speaker”).
- **Cons:** More complex than P2P; need a media server (e.g. Janus, Mediasoup, LiveKit).
- **When:** Webinars, large meetings, 1,000+ users. **Best default for “scale to 1,000+ users”.**

## MCU (Multipoint Conferencing Unit)

- **What:** Server decodes all streams, mixes them (e.g. one layout), and sends one (or a few) encoded stream(s) per client.
- **Pros:** Very low client bandwidth and CPU; good for very weak devices.
- **Cons:** High server CPU and latency; harder to scale to many participants; less flexible (e.g. fixed layout).
- **When:** When client devices are very constrained or you need a single mixed feed (e.g. legacy hardware).

## Recommendation for 1,000+ users

- Prefer an **SFU** (e.g. Mediasoup, LiveKit, Janus) so the server only forwards streams and clients subscribe to what they need.
- Run the SFU in **regions close to users** to keep latency low (e.g. one SFU per region or per large customer).
- Use **TURN/STUN** for NAT traversal; consider a **TURN server** in the same region as the SFU.
- Signaling can stay on your existing backend (WebSockets/HTTP); media goes through the SFU only.

## Where to run servers

- **Cloud regions:** AWS (e.g. us-east-1, eu-west-1), GCP, or Azure regions near your users.
- **Edge:** For global low latency, use edge PoPs (e.g. Cloudflare, Fastly) for signaling; media servers (SFU) in a few regional data centres.
- **Monitoring:** Track latency (e.g. RTT), packet loss, and CPU/memory on SFU nodes; alert on thresholds and scale horizontally by adding more SFU instances behind a load balancer.

## One-liner

Use an **SFU** for 1,000+ users; run it in **multiple regions**; keep **signaling** and **TURN** in the same region; monitor **latency and errors** and scale the SFU horizontally.
