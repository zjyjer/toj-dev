#include "toj_server_conn.h"

struct Judger_data {
	int runid;
	string vname;
	Judger_data * next;
};

struct ARG {
	int num;
	int fd;
};

bool portreuse[70000]={false};
Judger_data *head,*tail;
bool thread_busy[MAX_JUDGER_NUMBER];
bool used[MAX_JUDGER_NUMBER];
Judger_data dorunid[MAX_JUDGER_NUMBER];
string jvname[MAX_JUDGER_NUMBER];
int temp_num;
int queuesize;
pthread_mutex_t mutex_link=PTHREAD_MUTEX_INITIALIZER;
//pthread_mutex_t mutex_tb=PTHREAD_MUTEX_INITIALIZER;

void writelog(char * templog)
{
	FILE *fp=fopen(logfile,"a");
	if (fp!=NULL) {
		fprintf(fp,"%s",templog);
		fclose(fp);
	}
}

void result_dealer(char filename[200],int temp_pid,int temp_runid,int temp_cid,char temp_username[])
{
	DBClientConnection *db_client;
	db_client = new DBClientConnection();
	try {
		db_client->connect(db_ip);
	} catch(const mongo::DBException& e) {
		perror("Cannot connect MongoDB!\n");
		exit(1);
	}
	FILE *target_file = fopen(filename,"r");
	int type, ri, mu, tu;
	char resu[100] = {0};
	char ts[10][50];

	fscanf(target_file,"%s %d\n%s %d\n%s %d\n%s %d\n%s ",ts[0],&type,ts[1],&ri,ts[2],&mu,ts[3],&tu,ts[4]);
	fgets(resu, 100, target_file);

	char update[200]={0};

	BSONObj field = BSON("username" << 1 << "contest_belong" << 1 << "pid" << 1);
	BSONObj obj1 = db_client->findOne("toj.Status",BSON("run_ID" << ri), &field);

	temp_runid = ri;
	strcpy(temp_username,obj1.getStringField("username"));
	temp_cid = obj1.getIntField("contest_belong");
	temp_pid = obj1.getIntField("pid");
	resu[strlen(resu)-1] = 0;

	db_client->update("toj.Status",
			BSON("run_ID" << ri),
			BSON("$set" << BSON("result" << resu << "mem_used" << mu << "time_used" << tu << "speed" << 50)));

	if (strcmp(resu,"Accepted") == 0) {

		field = BSON("time_used" << 1 << "mem_used" << 1);
		obj1 = db_client->findOne("toj.Status",
					BSON("username" << temp_username << "pid" << temp_pid << "speed" << 51), &field);

		/* update total_ac+=1, update speed is possible */
		if(obj1.isEmpty()) { 
			db_client->update("toj.User",
					BSON("username" << temp_username),
					BSON("$inc" << BSON("total_ac" << 1)));
			db_client->update("toj.Status",
					BSON("run_ID" << ri),
					BSON("$set" << BSON("speed" << 51)));
		/* see if we can update the speed, faster? */
		} else { 
			int o_runid = obj1.getIntField("run_ID");
			int o_tu = obj1.getIntField("time_used");
			int o_mu = obj1.getIntField("mem_used");
			if(tu < o_tu && (tu == o_tu && mu < o_mu)) {
				db_client->update("toj.Status",
						BSON("run_ID" << o_runid),
						BSON("$set" << BSON("speed" << 50)));
				db_client->update("toj.Status",
						BSON("run_ID" << ri),
						BSON("$set" << BSON("speed" << 51)));
			}
		}
		db_client->update("toj.Problem",
				BSON("pid" << temp_pid),
				BSON("$inc" << BSON("total_ac" << 1)));
		if (temp_cid != -1) {
			db_client->update("toj.Contest_Problem",
					BSON("cid" << temp_cid << "pid" << temp_pid),
					BSON("$inc" << BSON("total_ac" << 1)));
		}
	}
	else if (strcmp(resu,"Wrong Answer")==0) {
		db_client->update("toj.Problem",
				BSON("pid" << temp_pid),
				BSON("$inc" << BSON("total_wa" << 1)));
		if (temp_cid != -1) {
			db_client->update("toj.Contest_Problem",
					BSON("cid" << temp_cid << "pid" << temp_pid),
					BSON("$inc" << BSON("total_wa" << 1)));
		}
	}
	else if (strcmp(resu,"Runtime Error")==0) {
		db_client->update("toj.Problem",
				BSON("pid" << temp_pid),
				BSON("$inc" << BSON("total_re" << 1)));
		if (temp_cid != -1) {
			db_client->update("toj.Contest_Problem",
					BSON("cid" << temp_cid << "pid" << temp_pid),
					BSON("$inc" << BSON("total_re" << 1)));
		}
	}
	else if (strcmp(resu,"Presentation Error")==0) {
		db_client->update("toj.Problem",
				BSON("pid" << temp_pid),
				BSON("$inc" << BSON("total_pe" << 1)));
		if (temp_cid != -1) {
			db_client->update("toj.Contest_Problem",
					BSON("cid" << temp_cid << "pid" << temp_pid),
					BSON("$inc" << BSON("total_pe" << 1)));
		}
	}
	else if (strcmp(resu,"Time Limit Exceeded")==0) {
		db_client->update("toj.Problem",
				BSON("pid" << temp_pid),
				BSON("$inc" << BSON("total_tle" << 1)));
		if (temp_cid != -1) {
			db_client->update("toj.Contest_Problem",
					BSON("cid" << temp_cid << "pid" << temp_pid),
					BSON("$inc" << BSON("total_tle" << 1)));
		}
	}
	else if (strcmp(resu,"Memory Limit Exceeded")==0) {
		db_client->update("toj.Problem",
				BSON("pid" << temp_pid),
				BSON("$inc" << BSON("total_mle" << 1)));
		if (temp_cid != -1) {
			db_client->update("toj.Contest_Problem",
					BSON("cid" << temp_cid << "pid" << temp_pid),
					BSON("$inc" << BSON("total_mle" << 1)));
		}
	}
	else if (strcmp(resu,"Output Limit Exceeded")==0) {
		db_client->update("toj.Problem",
				BSON("pid" << temp_pid),
				BSON("$inc" << BSON("total_ole" << 1)));
		if (temp_cid != -1) {
			db_client->update("toj.Contest_Problem",
					BSON("cid" << temp_cid << "pid" << temp_pid),
					BSON("$inc" << BSON("total_ole" << 1)));
		}
	}
	else if (strcmp(resu,"Restricted Function")==0) {
		db_client->update("toj.Problem",
				BSON("pid" << temp_pid),
				BSON("$inc" << BSON("total_rf" << 1)));
		if (temp_cid != -1) {
			db_client->update("toj.Contest_Problem",
					BSON("cid" << temp_cid << "pid" << temp_pid),
					BSON("$inc" << BSON("total_rf" << 1)));
		}
	}
	else if (strcmp(resu,"Compile Error")==0) {
		db_client->update("toj.Problem",
				BSON("pid" << temp_pid),
				BSON("$inc" << BSON("total_ce" << 1)));
		if (temp_cid != -1) {
			db_client->update("toj.Contest_Problem",
					BSON("cid" << temp_cid << "pid" << temp_pid),
					BSON("$inc" << BSON("total_ce" << 1)));
		}
	} else {
		db_client->update("toj.Problem",
				BSON("pid" << temp_pid),
				BSON("$inc" << BSON("total_other" << 1)));
		if (temp_cid != -1) {
			db_client->update("toj.Contest_Problem",
					BSON("cid" << temp_cid << "pid" << temp_pid),
					BSON("$inc" << BSON("total_other" << 1)));
		}
	}

	char tempce[50000]={0};
	char ce_info_data[MAX_DATA_SIZE] = {0};
	char ceupdate[MAX_DATA_SIZE] = {0};

	target_file=fopen(filename,"r");

	while (strcmp(tempce,"__COMPILE-INFO-BEGIN-LABLE__") != 0 && strcmp(tempce,"__COMPILE-INFO-BEGIN-LABLE__\n") != 0 && strcmp(tempce,"__COMPILE-INFO-BEGIN-LABLE__\r\n") != 0) fgets(tempce, 50000, target_file);

	while (1) {
		fgets(tempce,50000,target_file);
		if (strcmp(tempce,"__COMPILE-INFO-END-LABLE__") == 0 || strcmp(tempce,"__COMPILE-INFO-END-LABLE__\n") == 0 || strcmp(tempce,"__COMPILE-INFO-END-LABLE__\r\n") == 0) break;
		strcat(ce_info_data,tempce);
	}

	std::string str1;
	str1 = ce_info_data;
	int lastpos = 0;
	//    writelog("ca9\n");

	while (str1.find("\"",lastpos,1) != std::string::npos) {
		lastpos = str1.find("\"",lastpos,1);
		str1.replace(lastpos,1,"\\\"");
		lastpos += 2;
	}

	strcpy(ce_info_data,str1.c_str());

	db_client->update("toj.Status",
			BSON("run_ID" << ri),
			BSON("$set" << BSON("ce_info" << ce_info_data)));

	char templog[200]={0};
	sprintf(templog,"Received a result, user: %s, runid: %d result:%s\n",temp_username,temp_runid,resu);
	writelog(templog);
	fclose(target_file);

	free(db_client);
}

void judger_thread(ARG* arg)
{
	DBClientConnection *db_client;
	char buffer[MAX_DATA_SIZE] = {0};
	int tnum = arg->num;
	int tfd = arg->fd;
	while (1)
	{
		usleep(5000);

		if (thread_busy[tnum]) {
			{
				char templog[200]={0};
				sprintf(templog,"Fetching to no.%d\n",tnum);
				writelog(templog);
			}    

			db_client = new DBClientConnection();
			try {
				db_client->connect(db_ip);
			} catch(const mongo::DBException& e) {
				perror("Cannot connect MongoDB!\n");
				exit(1);
			}

			queuesize--;
			int temp_t;

			Judger_data *temp = &dorunid[tnum];


			BSONObj field = BSON("run_ID" << 1 << "lang" << 1 << "pid" << 1);
			BSONObj obj1 = db_client->findOne("toj.Status", BSON("run_ID" << temp->runid), &field);
			BSONObj obj2 = db_client->findOne("toj.Code", BSON("run_ID" << temp->runid));

			char filename[200] = {0};
			sprintf(filename, "raw_files/%d.bott", temp->runid);
			writelog("FILENAME: "); writelog(filename); writelog("\n");

			FILE* datafile = fopen(filename,"w");

			if (datafile == NULL) {
				char templog[200]={0};
				sprintf(templog,"CANNOT OPEN FILE %s!!!\n",filename);
				writelog(templog);
			}

			fprintf(datafile,"<type> 2\n");
			fprintf(datafile,"__SOURCE-CODE-BEGIN-LABLE__\n");
			fprintf(datafile,"%s\n",obj2.getStringField("code"));
			fprintf(datafile,"__SOURCE-CODE-END-LABLE__\n");
			fprintf(datafile,"<runid> %d\n<language> %d\n<pid> %d\n",obj1.getIntField("run_ID"), obj1.getIntField("lang"), obj1.getIntField("pid"));


			int temp_pid=obj1.getIntField("pid");
			field = BSON("vid" << 1);
			BSONObj obj3 = db_client->findOne("toj.Problem",BSON("pid" << temp_pid), &field);
			if(strcmp(obj3.getStringField("vid"), "") == 0) {
				/* Somehow it becomes int filed? */
				fprintf(datafile,"<vid> %d\n", obj3.getIntField("vid"));
			} else {
				fprintf(datafile,"<vid> %s\n", obj3.getStringField("vid"));
			}

			db_client->update("toj.Status",
				BSON("run_ID" << temp->runid),
				BSON("$set" << BSON("result" << "Judging")));

			fclose(datafile);
			if (temp->vname == jvname[tnum]) {
				int source = open(filename,O_RDONLY);
				while((temp_t = read(source, buffer, sizeof(buffer))) > 0)
					write(tfd, buffer, temp_t);
				close(source);
				sprintf(filename,"results/%dres.bott", temp->runid);
				writelog("filename: ");
				writelog(filename);
				writelog("\n");
				FILE *target_file = fopen(filename,"w");
				bool got_things = false;

				memset(buffer,0,sizeof(buffer));

				while (!got_things) {
					while ((temp_t = recv(tfd,buffer,MAX_DATA_SIZE,MSG_DONTWAIT)) > 0) {
						got_things = true;
						fputs(buffer, target_file);
					}
					if (temp_t == 0) {
						fclose(target_file);
						char templog[200]={0};
						sprintf(templog,"Lost connection with judger %d.\n",tnum);
						writelog(templog);
						sprintf(templog,"Runid: %d requeued.\n",temp->runid);
						writelog(templog);

						db_client->update("toj.Status",
								BSON("run_ID" << temp->runid),
								BSON("$set" << BSON("result" << "Judge Error")));

						temp = new Judger_data;
						temp->runid = dorunid[tnum].runid;
						temp->vname = dorunid[tnum].vname;
						temp->next = head;
						if (tail == NULL) tail = temp;
						head = temp;

						free(db_client);
						return;
					}
					usleep(5000);
				}
				fclose(target_file);
				int temp_runid;
				char temp1[50], temp2[50], temp3[50];
				sscanf(buffer,"%s%s%s%d", temp1, temp2, temp3, &temp_runid);
				sprintf(filename,"results/%dres.bott",temp_runid);
				target_file=fopen(filename,"w");
				fputs(buffer,target_file);
				//writelog("ca3\n");
				while (recv(tfd,buffer,MAX_DATA_SIZE,MSG_DONTWAIT)>0)
					fputs(buffer,target_file);
				fclose(target_file);
				//writelog("ca4\n");
			}
			else {
				sprintf(filename,"results/%dres.bott",temp->runid);
				FILE * target_file=fopen(filename,"w");
				fprintf(target_file,"<type> 3\n");
				fprintf(target_file,"<runid> %d\n",temp->runid);
				fprintf(target_file,"<memory_used> 0\n");
				fprintf(target_file,"<time_used> 3\n");
				fprintf(target_file,"<result> Judge Error (Vjudge Failed)\n");
				fprintf(target_file,"__COMPILE-INFO-BEGIN-LABLE__\n\n__COMPILE-INFO-END-LABLE__\n");
				fclose(target_file);
			}
			//writelog("ca5\n");
			field = BSON("pid" << 1 << "contest_belong" << 1 << "username" << 1);
			BSONObj obj4 = db_client->findOne("toj.Status",BSON("run_ID" << temp->runid), &field);
			/*
			sprintf(query,"SELECT pid,contest_belong,username FROM status WHERE runid=%d",temp->runid);
			temp_t=mysql_real_query(mysql,query,strlen(query));
			if (temp_t) {
				perror("mysql query error!");
				exit(1);
			}
			res=mysql_use_result(mysql);
			row=mysql_fetch_row(res);
			*/
			temp_pid=obj4.getIntField("pid");
			int temp_cid = obj4.getIntField("contest_belong");
			char temp_username[256]={0};
			strcpy(temp_username, obj4.getStringField("username"));

			result_dealer(filename,temp_pid,temp->runid,temp_cid,temp_username);

			char templog[10000];

			dorunid[tnum].runid = -1;
			thread_busy[tnum] = false;
			sprintf(templog,"%d Judge Finished\n",tnum,thread_busy[tnum]);
			writelog(templog);

			free(db_client);
		}
	}
}


void * function (void * arg)
{
	int fd = ((ARG *)arg)->fd;
	int tnum = ((ARG *)arg)->num;
	char buffer[255]={0};

	/* the thread is now busying */
	thread_busy[tnum]=true;

	struct timeval case_startv,case_nowv;
	struct timezone case_startz,case_nowz;
	gettimeofday(&case_startv,&case_startz);
	int time_passed;

	/* Recv things, submit or judger register */
	while (1)
	{
		usleep(10000);
		gettimeofday(&case_nowv,&case_nowz);
		time_passed=(case_nowv.tv_sec-case_startv.tv_sec)*1000+(case_nowv.tv_usec-case_startv.tv_usec)/1000;
		if (recv(fd,buffer,255,MSG_DONTWAIT)>0||time_passed>5000) break;
	}

	char connect_type[50]={0};
	sscanf(buffer, "%s", connect_type);
	printf("current fd:%d\n", fd);

	if (strcmp(connect_type, submit_string) == 0) {
		int runid;
		char vname[100];
		sscanf(buffer, "%s%d%s", connect_type, &runid, vname);
		char templog[200]={0};
		sprintf(templog,"received a submit, runid: %d\ncurrent queuesize: %d\n", runid, queuesize);
		writelog(templog);
		Judger_data *temp;
		temp = new Judger_data;
		temp->runid = runid;
		temp->vname = vname;
		temp->next = NULL;
		pthread_mutex_lock(&mutex_link);
		if (tail != NULL) tail->next = temp;
		tail = temp;
		if (head==NULL) head = temp;
		pthread_mutex_unlock(&mutex_link);
		queuesize ++;
	} else if (strcmp(connect_type, error_string) == 0) {
		int runid;
		char vname[100];
		sscanf(buffer, "%s%d%s", connect_type, &runid, vname);
		char templog[200]={0};
		sprintf(templog,"received a error rejudge, runid: %d\ncurrent queuesize: %d\n",runid,queuesize);
		writelog(templog);
		Judger_data *temp;
		temp = new Judger_data;
		temp->runid = runid;
		temp->vname = vname;
		temp->next = NULL;
		pthread_mutex_lock(&mutex_link);
		if (tail != NULL) tail->next = temp;
		tail = temp;
		if (head == NULL) head = temp;
		pthread_mutex_unlock(&mutex_link);
		queuesize ++;
	} else if (strcmp(connect_type, judger_string) == 0) {
		char templog[200] = {0};
		char vname[100];
		sscanf(buffer, "%s%s", connect_type, vname);
		sprintf(templog, "judger %d : %s connected. \n", tnum, vname);
		jvname[tnum] = vname;
		writelog(templog);

		/* this thread is not busy now, ready to judge */
		thread_busy[tnum] = false;

		judger_thread((ARG*) arg);
		writelog("Judger Finished\n");
		jvname[tnum] = "";
	} else if (strcmp(connect_type, rejudge_string) == 0) {
		/*
		int repid, recid;
		sscanf(buffer, "%s%d%d", connect_type, &repid, &recid);
		MYSQL_RES *res;
		MYSQL_ROW row;
		MYSQL * mysql;
		mysql=(MYSQL *)malloc(sizeof(MYSQL));
		mysql_init(mysql);
		if (!mysql_real_connect(mysql,NULL,db_user,db_pass,db_table,MYSQL_PORT,NULL,0)) {
			perror("cannot connect mysql!\n");
			exit(1);
		}
		mysql_query(mysql,"set names utf8");
		char query[200]={0};
		sprintf(query,"SELECT runid,vname FROM status,problem WHERE result='Rejudging' and contest_belong=%d and status.pid=%d and status.pid=problem.pid order by runid",recid,repid);

		mysql_query(mysql,query);
		res=mysql_use_result(mysql);
		int rejudge_num=0;
		pthread_mutex_lock(&mutex_link);
		while ((row=mysql_fetch_row(res)))
		{
			queuesize++;
			rejudge_num++;
			Judger_data *temp;
			temp=new Judger_data;
			temp->runid=atoi(row[0]);
			temp->vname=row[1];
			temp->next=NULL;
			if (tail!=NULL) tail->next=temp;
			tail=temp;
			if (head==NULL) head=temp;
		}
		pthread_mutex_unlock(&mutex_link);
		char templog[200]={0};
		sprintf(templog,"received a rejudge request, pid: %d, cid: %d, num: %d\n",repid,recid,rejudge_num);
		writelog(templog);
		mysql_free_result(res);
		mysql_close(mysql);
		free(mysql);
		*/
	}
	else {
		writelog("Illegal connection!\nServer Recieved:\n");
		writelog(buffer);
		writelog("\n");
	}
	close(fd);
	//printf("fd after close:%d\n",fd);
	free(arg);
	pthread_detach(pthread_self());
	used[tnum] = false;
	//    pthread_mutex_lock(&mutex_tb);
	thread_busy[tnum] = false;
	//    pthread_mutex_unlock(&mutex_tb);
	pthread_exit(NULL);
}

void * fetcher(void * arg)
{
	while (1) {
		usleep(2013);
		pthread_mutex_lock(&mutex_link);
		if (head == NULL) {
			pthread_mutex_unlock(&mutex_link);
			//printf("Empty queue.\n");
			continue;
		}
		Judger_data *tj = head, *last = NULL, *tmp;
		while (tj != NULL) {
			bool f = false;
			for (int i = 0;i < MAX_JUDGER_NUMBER; ++i) {
				if (!thread_busy[i] && used[i] && jvname[i] == tj->vname) {
					char templog[200];
					sprintf(templog,"Fetched %d\n",tj->runid);
					writelog(templog);
					dorunid[i] = *tj;
					if (last == NULL) head = tj->next;
					else last->next = tj->next;
					if (tj->next == NULL) tail = last;
					tmp = tj;
					tj = tj->next;
					f = true;
					free(tmp);
					//if (tj==NULL) head=NULL;
					thread_busy[i] = true;
					break;
				}
				//            pthread_mutex_unlock(&mutex_tb);
			}
			if (!f) {
				last = tj;
				tj = tj->next;
			}
		}
		pthread_mutex_unlock(&mutex_link);
	}
}

int main(int argc, char * argv[])
{
	/* Initialize */
	init();
	mkdir("raw_files",0777);
	mkdir("results",0777); 


	pthread_t tid;
	ARG *arg;
	DBClientConnection *db_client;
	auto_ptr<DBClientCursor> cursor;

	int sockfd, client_fd;
	struct sockaddr_in my_addr;
	struct sockaddr_in remote_addr;

	
	/* Socket Server: socket->bind->listen */
	if ((sockfd = socket(AF_INET, SOCK_STREAM, 0)) == -1) {
		perror("socket() error\n");
		exit(1);
	}
	my_addr.sin_family = AF_INET;
	my_addr.sin_port = htons(server_port);
	my_addr.sin_addr.s_addr = INADDR_ANY;
	bzero(&(my_addr.sin_zero),8);
	if (bind(sockfd, (struct sockaddr *) & my_addr, sizeof (struct sockaddr)) == -1) {
		perror("bind() error\n");
		exit(1);
	}
	if (listen(sockfd, 10) == -1) {
		perror("listen() error\n");
		exit(1);
	}
	socklen_t sin_size = sizeof (struct sockaddr_in);
	/* Ready for accept */

	
	db_client = new DBClientConnection();
	try {
		db_client->connect(db_ip);
	} catch(const mongo::DBException& e) {
		perror("Cannot connect MongoDB!\n");
		exit(1);
	}

	if (argc > 1 && strcmp(argv[1], "sj") == 0) {
		BSONObj field = BSON("run_ID" << 1 << "oj" << 1);
		BSONObj query = mongo::OR(BSON("result" << "Waiting"),BSON("result" << "Judging"),BSON("result" << "Rejudging"));
		cursor = db_client->query("toj.Status",
				Query(query).sort("run_ID"),
				0, 0, &field);
	} else {
		BSONObj field = BSON("run_ID" << 1 << "oj" << 1);
		BSONObj query = BSON("result" << "Waiting");
		cursor = db_client->query("toj.Status",
				Query(query).sort("run_ID"),
				0, 0, &field);
	}

	/* I don't know how to catch this exception for now ... later
	if(!cursor) {
		perror("Cannot query MongoDB!\n");
		exit(1);
	}
	*/

	while(cursor->more()) {
		BSONObj p = cursor->next();
		queuesize ++;
		Judger_data *temp;
		temp = new Judger_data;
		temp->runid = p.getIntField("run_ID");
		temp->vname = p.getStringField("oj");
		temp->next = NULL;
		if (tail != NULL) tail->next = temp;
		tail=temp;
		
	}
	free(db_client);

	/* create a thread as fetcher, decide which thread to do which job. */
	pthread_create(&tid,NULL,fetcher,NULL);

	/* Ready for connection, judger or job */
	while (1)
	{
		if ((client_fd = accept(sockfd, (struct sockaddr *) & remote_addr, &sin_size)) == -1) {
			perror("accept() error");
			exit(1);
		}
		char templog[200]={0};
		sprintf(templog,"received a connection from %s:%d\n", inet_ntoa(remote_addr.sin_addr), remote_addr.sin_port);
		writelog(templog);

		arg = new ARG;
		arg->fd = client_fd;
		for (temp_num = 0;temp_num < MAX_JUDGER_NUMBER; ++temp_num) if (!used[temp_num]) break;
		arg->num = temp_num;
		used[temp_num] = true;
		pthread_create(&tid, NULL, function, (void *)arg);
	}
	close(sockfd);
	exit(0);
}
