import sqlite3
import math
import time

class khanfused_db :
	def __init__(self) :
		self.write(
			'''CREATE TABLE IF NOT EXISTS "Sessions" (
			"id" INTEGER NOT NULL UNIQUE,
			"last_active"	INTEGER NOT NULL,
			PRIMARY KEY("id")
			);'''
			)
		
	def update_session(self, session_id) :
		self.write(
			'''INSERT INTO Sessions (id, last_active) VALUES (?, ?)''', (
				session_id, math.floor(time.time())
				)
			)

	def clear_sessions(self, age_in_seconds) :
		self.write(
			'''DELETE FROM Sessions WHERE last_active < ?''', (
				math.floor(time.time()) - age_in_seconds,
				)
			)
		
	def query(self, session_id) :
		self.write(
			'''SELECT COUNT(*) FROM Sessions WHERE session_id = ?''', (
				session_id,
				)
			)

	def write(self, command, parameters = ()) :
		database = sqlite3.connect('khanfused.db')
		cursor = database.cursor()
		cursor.execute(command, parameters)
		database.commit()
		database.close()