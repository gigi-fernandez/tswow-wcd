/*
 * Copyright (C) 2020 tswow <https://github.com/tswow/>
 * This program is free software: you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as
 * published by the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

/* tslint:disable */
import { int, loc_constructor } from '../../primitives'
import { Relation } from '../../query/Relations'
import { PrimaryKey } from '../../table/PrimaryKey'
import { DBCIntArrayCell, DBCKeyCell, DBCLocCell, DBCStringCell } from '../DBCCell'
import { DBCFile } from '../DBCFile'
import { DBCRow } from '../DBCRow'

 /**
  * Main row definition
  * - Add column comments to the commented getters below
  * - Add file comments to DBCFiles.ts
  */
export class ItemRandomSuffixRow extends DBCRow<ItemRandomSuffixCreator,ItemRandomSuffixQuery> {
    /**
     * Primary Key
     *
     * No comment (yet!)
     */
    @PrimaryKey()
    get ID() { return new DBCKeyCell(this,this.buffer,this.offset+0)}

    /**
     * No comment (yet!)
     */
    get Name() { return new DBCLocCell(this,this.buffer,this.offset+4)}

    /**
     * No comment (yet!)
     */
    get InternalName() { return new DBCStringCell(this,this.buffer,this.offset+72)}

    /**
     * No comment (yet!)
     */
    get Enchantment() { return new DBCIntArrayCell(this,5,this.buffer,this.offset+76)}

    /**
     * No comment (yet!)
     */
    get AllocationPct() { return new DBCIntArrayCell(this,5,this.buffer,this.offset+96)}

    /**
     * Creates a clone of this row with new primary keys.
     *
     * Cloned rows are automatically added at the end of the DBC file.
     */
    clone(ID : int, c? : ItemRandomSuffixCreator) : this {
        return this.cloneInternal([ID],c);
    }
}

/**
 * Used for object creation (Don't comment these)
 */
export type ItemRandomSuffixCreator = {
    Name?: loc_constructor
    InternalName?: string
    Enchantment?: int
    AllocationPct?: int
}

/**
 * Used for queries (Don't comment these)
 */
export type ItemRandomSuffixQuery = {
    ID? : Relation<int>
    Name? : Relation<string>
    InternalName? : Relation<string>
    Enchantment? : Relation<int>
    AllocationPct? : Relation<int>
}

/**
 * Table definition (specifies arguments to 'add' function)
 * - Add file comments to DBCFiles.ts
 */
export class ItemRandomSuffixDBCFile extends DBCFile<
    ItemRandomSuffixCreator,
    ItemRandomSuffixQuery,
    ItemRandomSuffixRow> {
    add(ID : int, c? : ItemRandomSuffixCreator) : ItemRandomSuffixRow {
        return this.makeRow(0).clone(ID,c)
    }
    findById(id: number) {
        return this.fastSearch(id);
    }
}

/**
 * Table singleton (Object used by 'DBC' namespace)
 * - Add file comments to DBCFiles.ts
 */
export const DBC_ItemRandomSuffix = new ItemRandomSuffixDBCFile(
    'ItemRandomSuffix',
    (table,buffer,offset)=>new ItemRandomSuffixRow(table,buffer,offset))
