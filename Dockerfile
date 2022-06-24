FROM btwiuse/k0s AS k0s

FROM denoland/deno:debian AS deno

# dkg push -i btwiuse/subshell:bin -f subshell
FROM btwiuse/subshell:bin AS subshell-bin

FROM node

RUN apt update

COPY --from=k0s /usr/bin/k0s /bin/hub
COPY --from=deno /usr/bin/deno /bin
# COPY --from=subshell-bin --chmod=777 /subshell /bin
COPY --from=subshell-bin /subshell /bin

RUN chmod a+rx /bin/subshell

RUN ln -sf /bin/hub /bin/agent

# RUN apk add nodejs-current npm yarn jq vim bash tmux htop neofetch

RUN apt install -y jq vim bash tmux htop neofetch figlet sudo

ADD subsh-deno /bin/

COPY cache.ts .
COPY init.ts .
COPY client.ts .

ENV DENO_DIR=/cache

RUN subsh-deno cache

RUN useradd -N subshell

RUN chown -R subshell /cache

USER subshell

ENTRYPOINT ["bash", "-c"]

CMD ["hub --port :${PORT:-8000}"]
