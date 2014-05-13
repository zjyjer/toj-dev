#ifndef SERVER_CONN_H_INCLUDED
#define SERVER_CONN_H_INCLUDED

#include <stdio.h>
#include <stdlib.h>
#include <assert.h>
#include <string.h>
#include <strings.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <sys/fcntl.h>
#include <sys/socket.h>
#include <sys/wait.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <sys/time.h>
#include <errno.h>
#include <netdb.h>
#include <pthread.h>
//#include <mysql/mysql.h>
#include <string>

#include "mongo/client/dbclient.h"

using namespace std;
using namespace mongo;

#define MAX_JUDGER_NUMBER 255
#define MAX_DATA_SIZE 655350
#define CHECK_STATUS 1
#define NEED_JUDGE 2
#define SEND_DATA 3
#define JUDGER_STATUS_REPORT 1
#define NEED_DATA 2
#define RESULT_REPORT 3
#define CPPLANG 1
#define CLANG 2
#define JAVALANG 3
#define FPASLANG 4
#define AC_STATUS 0
#define CE_STATUS 1
#define RE_STATUS 2
#define WA_STATUS 3
#define TLE_STATUS 4
#define MLE_STATUS 5
#define PE_STATUS 6

char db_ip[50]={0};
char db_port[50]={0};
char db_name[50]={0};
char judger_string[100]={0};
char submit_string[100]={0};
char rejudge_string[100]={0};
char error_string[100]={0};
char logfile[100]={0};
int server_port;

void init()
{
    FILE * fin=fopen("config.ini","r");
    fscanf(fin,"%s%s%s%d%s%s%s%s%s",db_ip,db_port,db_name,&server_port,judger_string,submit_string,rejudge_string,error_string,logfile);
    fclose(fin);
}

#endif // SERVER_CONN_H_INCLUDED
