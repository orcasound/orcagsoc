FROM python:3.8
WORKDIR /orcagsoc
COPY Pipfile Pipfile
COPY Pipfile.lock Pipfile.lock
RUN pip install pipenv
RUN pipenv install --deploy --ignore-pipfile
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
RUN apt install unzip
RUN unzip awscliv2.zip
RUN ./aws/install

COPY app app
COPY migrations migrations
COPY boot.sh ./

ENV FLASK_APP app

EXPOSE 5000
ENTRYPOINT ["./boot.sh"]