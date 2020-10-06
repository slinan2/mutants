## Prerequisites

1. `git` and `node` must be installed.
2. `docker-compose`

## Run services

### Running project (In Amazon AWS)
**API URL:** http://ec2-52-34-160-15.us-west-2.compute.amazonaws.com:3030/

### Running locally
```sh
$ git clone https://github.com/slinan2/mutants
$ cd mutants
$ docker-compose up
```

## Tests
Integration and unit tests were created. The coverage is 91.96%.

**This is the coverage report:** https://slinan2.github.io/mutants/


### Run tests

```sh
$ docker-compose -f docker-compose-test.yml up
```
