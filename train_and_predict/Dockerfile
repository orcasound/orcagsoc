FROM tensorflow/tensorflow:latest-gpu

WORKDIR /orcagsoc

COPY requirements.txt requirements.txt
RUN pip install --upgrade pip
RUN pip install -r requirements.txt
RUN pip install gunicorn
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
RUN apt install unzip
RUN unzip awscliv2.zip
RUN ./aws/install

COPY app.py train.py predict.py ./

ENV FLASK_APP app.py

EXPOSE 5001
CMD gunicorn -b :5001 --access-logfile - --error-logfile - app:app --timeout 100000