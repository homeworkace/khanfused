import sqlite3
import math
import time

class khanfused_db :
	def __init__(self) :
		self.write(
			'''CREATE TABLE IF NOT EXISTS "Sessions" (
			"id" INTEGER NOT NULL UNIQUE,
			"last_active"	INTEGER NOT NULL,
			"name" STRING,
			"lobby" STRING,
			PRIMARY KEY("id")
			);'''
			)
		
	def new_session(self, session_id) :
		self.write(
			'''INSERT INTO Sessions (id, last_active) VALUES (?, ?)''', (
				int(session_id), math.floor(time.time())
				)
			)
		
	def refresh_session(self, session_id) :
		self.write(
			'''UPDATE Sessions SET last_active = ? WHERE id = ?''', (
				math.floor(time.time()), int(session_id)
				)
			)

	def clear_sessions(self, age_in_seconds) :
		result = self.write(
			'''SELECT id, lobby FROM Sessions WHERE last_active < ?''', (
				math.floor(time.time()) - age_in_seconds,
				)
			)
		self.write(
			'''DELETE FROM Sessions WHERE last_active < ?''', (
				math.floor(time.time()) - age_in_seconds,
				)
			)
		return result

	def update_lobby(self, session_id, lobby_code = None) :
		self.write(
			'''UPDATE Sessions SET lobby = ? WHERE id = ?''', (
				lobby_code, int(session_id)
				)
			)
		
	def query_session(self, session_id) :
		if not session_id.isnumeric() :
			return None
		result = self.write(
			'''SELECT * FROM Sessions WHERE id = ?''', (
				int(session_id),
				)
			)
		if len(result) < 1 :
			return None
		return result[0]

	def write(self, command, parameters = ()) :
		database = sqlite3.connect('khanfused.db')
		cursor = database.cursor()
		cursor.execute(command, parameters)
		result = cursor.fetchall()
		database.commit()
		database.close()
		return result