FROM btwiuse/k0s AS k0s

FROM btwiuse/dkg AS dkg

# cargo build --release && cd ./target/release/ && cp deno subshell && dkg push -i btwiuse/subshell:bin -f subshell
FROM btwiuse/subshell:bin AS subshell-bin

FROM btwiuse/arch:deno

ENV RUNNING_IN_DOCKER=1

RUN pacman -Syu --noconfirm --needed --overwrite='*' htop neofetch figlet

COPY --from=k0s /usr/bin/k0s /bin/hub
COPY --from=dkg /bin/dkg /bin
# COPY --from=subshell-bin --chmod=777 /subshell /bin
COPY --from=subshell-bin /subshell /bin

RUN chmod a+rx /bin/subshell

RUN ln -sf /bin/hub /bin/agent

ADD subsh-deno /bin/

COPY *.ts ./
COPY package.json ./

ENV DENO_DIR=/cache

RUN subsh-deno cache

RUN useradd -N subshell

RUN chown -R subshell /cache

COPY deno_history.txt /cache/
RUN chown root:root /cache/deno_history.txt
RUN chmod 644 /cache/deno_history.txt

USER subshell

ENV SUBSHELL_VERSION 0.2.28

CMD hub
