import sqlite3
import math
import time

class khanfused_db :
	def __init__(self) :
		database = sqlite3.connect('khanfused.db')
		cursor = database.cursor()
		cursor.execute(
			'''CREATE TABLE IF NOT EXISTS "Sessions" (
			"id"	INTEGER NOT NULL UNIQUE,
			"last_active"	INTEGER NOT NULL,
			PRIMARY KEY("id")
			);'''
			)
		database.commit()
		database.close()
		
	def update_session(self, session_id) :
		database = sqlite3.connect('khanfused.db')
		cursor = database.cursor()
		cursor.execute(
			'''INSERT INTO Sessions (id, last_active) VALUES (?, ?)''', (
				session_id, math.floor(time.time())
				)
			)
		database.commit()
		database.close()

	def write(command) :
		database = sqlite3.connect('khanfused.db')
		cursor = database.cursor()
		cursor.execute(command)
		database.commit()
		database.close()

	def clear_sessions(self) :
		database = sqlite3.connect('khanfused.db')
		cursor = database.cursor()
		cursor.execute(
			'''DELETE FROM Sessions WHERE last_active < ?''', (
				str(math.floor(time.time()) - 1800),
			)
			)
		database.commit()
		database.close()
		pass